import { TRPCError, type TRPCRouterRecord } from '@trpc/server';
import { and, asc, desc, eq, ilike, lt, or, gt } from 'drizzle-orm';
import { z } from 'zod';

import {
  createGroupSchema,
  addMemberSchema,
  groupIdInputSchema,
  updateGroupSchema,
} from '../schema';
import { protectedProcedure } from '../trpc';

import { group, groupInvite, groupMember } from '~/db/schema';
import { addDays } from 'date-fns';
import { getGroupBalancesTotal } from '~/server/functions/get-group-balances-total';
const GROUPS_PER_PAGE = 15; // Define how many groups to fetch per page

type GroupWithMembers = typeof group.$inferSelect & {
  members: (typeof groupMember.$inferSelect)[];
};

type GroupWithBalance = GroupWithMembers & {
  balance: number;
};

export const groupRouter = {
  // Get all groups the current user is a member of
  all: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).nullish(),
        cursor: z // Define cursor structure: { createdAt: Date, id: string }
          .object({ createdAt: z.date(), id: z.string() })
          .nullish(),
        searchTerm: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input.limit ?? GROUPS_PER_PAGE;
      const { cursor, searchTerm } = input;

      // Build search filter condition
      const searchFilter = searchTerm
        ? or(ilike(group.name, `%${searchTerm}%`), ilike(group.description, `%${searchTerm}%`))
        : undefined;

      // Fetch groups where the user is a member
      const groups = (await ctx.db.query.group.findMany({
        where: (groupSchema, { exists, and: andWhere }) =>
          andWhere(
            // Filter by user membership
            exists(
              ctx.db
                .select({ gId: groupMember.groupId }) // Select only needed field
                .from(groupMember)
                .where(and(eq(groupMember.groupId, groupSchema.id), eq(groupMember.userId, userId)))
            ),
            searchFilter,
            // Apply cursor logic: fetch items older than the cursor
            cursor
              ? or(
                  lt(groupSchema.createdAt, cursor.createdAt),
                  // If createdAt is the same, use id as tie-breaker
                  and(eq(groupSchema.createdAt, cursor.createdAt), lt(groupSchema.id, cursor.id))
                )
              : undefined // No cursor for the first page
          ),
        orderBy: [desc(group.createdAt), desc(group.id)], // Order matching cursor logic
        limit: limit + 1, // Fetch one extra item to determine if there's a next page
        with: {
          members: {
            columns: {
              userId: true,
              role: true,
            },
          },
        },
      })) as GroupWithMembers[];

      //* for each item, get getGroupBalances
      const groupBalances = await Promise.all(
        groups?.map(async (item) => ({
          groupId: item.id,
          balance: await getGroupBalancesTotal(ctx, { groupId: item.id, limit: 100 }),
        }))
      );

      //* add groupedBalances to groups
      const groupWithBalances = groups.map((group) => ({
        ...group,
        balance: groupBalances.find((item) => item.groupId === group.id)?.balance || 0,
      })) satisfies GroupWithBalance[];

      let nextCursor: typeof cursor | undefined = undefined;
      if (groups.length > limit) {
        // Remove the extra item
        const nextItem = groups.pop();
        // Set the next cursor based on the last item *not* returned
        if (nextItem) {
          nextCursor = { createdAt: nextItem.createdAt, id: nextItem.id };
        }
      }

      return {
        items: groupWithBalances,
        nextCursor,
      };
    }),
  // Get a specific group by ID
  getById: protectedProcedure.input(groupIdInputSchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    // Check if user is a member of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
    });

    if (!membership) {
      throw new Error("You don't have access to this group");
    }

    return ctx.db.query.group.findFirst({
      where: eq(group.id, input.groupId),
      with: {
        members: {
          with: {
            user: true,
          },
          orderBy: asc(groupMember.joinedAt),
        },
      },
    });
  }),

  // Get most-recent group
  getMostRecentGroup: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const mostRecentGroup = await ctx.db.query.group.findFirst({
      where: eq(group.createdById, userId),
      orderBy: desc(group.createdAt),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    return mostRecentGroup ?? null;
  }),

  // Initialize a new group
  initialize: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Create a new group
    const [newGroup] = await ctx.db
      .insert(group)
      .values({
        name: 'New Group',
        description: null,
        createdById: userId,
      })
      .returning({
        id: group.id,
      });
    // Add the creator as a member with owner role
    await ctx.db.insert(groupMember).values({
      groupId: newGroup.id,
      userId,
      role: 'owner',
    });

    // return the new group
    const newGroupWithMembers = await ctx.db.query.group.findFirst({
      where: eq(group.id, newGroup.id),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    return newGroupWithMembers;
  }),
  create: protectedProcedure.input(createGroupSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Create the group
    const [newGroup] = await ctx.db
      .insert(group)
      .values({
        ...input,
        createdById: userId,
      })
      .returning({
        id: group.id,
        name: group.name,
      });

    // Add the creator as a member with owner role
    await ctx.db.insert(groupMember).values({
      groupId: newGroup.id,
      userId,
      role: 'owner',
    });

    return newGroup;
  }),

  // Upsert a group
  update: protectedProcedure.input(updateGroupSchema).mutation(async ({ ctx, input }) => {
    let groupId = input.id;
    if (!groupId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Group ID is required',
      });
    }

    const updateData: Partial<typeof group.$inferInsert> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    updateData.updatedAt = new Date();

    // Update the group
    const [updatedGroup] = await ctx.db
      .update(group)
      .set(updateData)
      .where(eq(group.id, groupId))
      .returning({
        id: group.id,
      });

    return updatedGroup;
  }),

  // Delete a group (only if the user is the owner)
  delete: protectedProcedure.input(groupIdInputSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is the owner of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(
        eq(groupMember.groupId, input.groupId),
        eq(groupMember.userId, userId),
        eq(groupMember.role, 'owner')
      ),
    });

    if (!membership) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only group owners can delete groups',
      });
    }

    // Delete all group members first (due to foreign key constraints)
    // await ctx.db.delete(groupMember).where(eq(groupMember.groupId, input.groupId));

    // Delete the group
    await ctx.db.delete(group).where(eq(group.id, input.groupId));

    return { success: true };
  }),

  // Get an existing invite link for a group
  getInviteLink: protectedProcedure.input(groupIdInputSchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is a member of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
    });

    if (!membership) {
      throw new Error("You don't have access to this group");
    }

    // Check if an invite link already exists and is not expired
    const existingInvite = await ctx.db.query.groupInvite.findFirst({
      where: and(eq(groupInvite.groupId, input.groupId), gt(groupInvite.expiresAt, new Date())),
    });

    return existingInvite || null;
  }),

  // Generate a new invite link for a group
  generateInviteLink: protectedProcedure
    .input(groupIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member of this group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this group");
      }

      // Check if an invite link already exists
      const existingInvite = await ctx.db.query.groupInvite.findFirst({
        where: eq(groupInvite.groupId, input.groupId),
      });

      if (existingInvite) {
        // Update the invite link
        const [updatedInvite] = await ctx.db
          .update(groupInvite)
          .set({
            expiresAt: addDays(new Date(), 7),
          })
          .where(eq(groupInvite.id, existingInvite.id))
          .returning();

        return updatedInvite;
      }

      // Create a new invite link
      const [newInvite] = await ctx.db
        .insert(groupInvite)
        .values({
          groupId: input.groupId,
        })
        .returning();

      return newInvite;
    }),

  // Deactivate (remove) an invite link for a group
  deactivateInviteLink: protectedProcedure
    .input(groupIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member of this group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this group");
      }

      // Delete the invite link
      await ctx.db.delete(groupInvite).where(eq(groupInvite.groupId, input.groupId));

      return { success: true };
    }),

  // Add a member to a group
  addMember: protectedProcedure.input(addMemberSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is a member of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
    });

    if (!membership) {
      throw new Error("You don't have access to this group");
    }

    // Add the new member
    const [newMember] = await ctx.db.insert(groupMember).values(input).returning();

    return newMember;
  }),

  // Remove a member from a group
  removeMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      // Check if current user is the owner
      const isOwner = await ctx.db.query.groupMember.findFirst({
        where: and(
          eq(groupMember.groupId, input.groupId),
          eq(groupMember.userId, currentUserId),
          eq(groupMember.role, 'owner')
        ),
      });

      // Check if the user is removing themselves
      const isSelf = currentUserId === input.userId;

      if (!isOwner && !isSelf) {
        throw new Error('Only group owners can remove members');
      }

      // Delete the membership
      await ctx.db
        .delete(groupMember)
        .where(and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, input.userId)));

      return { success: true };
    }),

  // Get a group by invite token
  getByInviteToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.query.groupInvite.findFirst({
        where: and(eq(groupInvite.token, input.token), gt(groupInvite.expiresAt, new Date())),
      });

      if (!invite) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid or expired invite link' });
      }

      return ctx.db.query.group.findFirst({
        where: eq(group.id, invite.groupId),
        columns: {
          name: true,
          description: true,
          id: true,
        },
      });
    }),

  // Join a group using an invite link
  joinByInvite: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find the invite and check if it's valid
      const invite = await ctx.db.query.groupInvite.findFirst({
        where: and(eq(groupInvite.token, input.token), gt(groupInvite.expiresAt, new Date())),
      });

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired invite link',
        });
      }

      // Check if user is already a member of this group
      const existingMembership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, invite.groupId), eq(groupMember.userId, userId)),
      });

      if (existingMembership) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already a member of this group',
        });
      }

      // Add the user as a member
      const [newMember] = await ctx.db
        .insert(groupMember)
        .values({
          groupId: invite.groupId,
          userId,
          role: 'member',
        })
        .returning();

      return newMember;
    }),
} satisfies TRPCRouterRecord;
