import { TRPCError, type TRPCRouterRecord } from '@trpc/server';
import { and, asc, desc, eq, ilike, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import {
  createGroupSchema,
  addMemberSchema,
  groupIdInputSchema,
  upsertGroupSchema,
} from '../schema';
import { protectedProcedure } from '../trpc';

import { group, groupMember } from '~/db/schema';
import { getGroupBalances } from '~/server/functions/get-group-balances';
import { DEFAULT_GROUP_NAME } from '~/server/functions/initialize-expense';
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
            },
          },
        },
      })) as GroupWithMembers[];

      //* for each item, get getGroupBalances
      const groupBalances = await Promise.all(
        groups.map((item) => getGroupBalances(ctx, { groupId: item.id, limit: 100 }))
      );

      //* accumulate sum of balances into groups
      const groupedBalances: Record<string, number> = {};
      for (const [index, expense] of groups.entries()) {
        // For each group, calculate the total balance
        const groupBalance = groupBalances[index];
        groupedBalances[expense.id] = groupBalance.reduce((acc, curr) => acc + curr.balance, 0);
      }

      //* add groupedBalances to groups
      const groupWithBalances = groups.map((expense) => ({
        ...expense,
        balance: groupedBalances[expense.id],
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

  /**
   * Get the default group for the current user
   */
  getDefault: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.query.group.findFirst({
      where: and(eq(group.createdById, userId), eq(group.name, DEFAULT_GROUP_NAME)),
    });
  }),

  // Create a new group
  create: protectedProcedure.input(createGroupSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Create the group
    const [newGroup] = await ctx.db
      .insert(group)
      .values({
        ...input,
        createdById: userId,
      })
      .returning();

    // Add the creator as a member with owner role
    await ctx.db.insert(groupMember).values({
      groupId: newGroup.id,
      userId,
      role: 'owner',
    });

    return newGroup;
  }),

  // Upsert a group
  upsert: protectedProcedure.input(upsertGroupSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    let groupId = input.id;

    //* Create if not exists *//
    if (!groupId) {
      if (!input.name) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Group name is required',
        });
      }
      const [newGroup] = await ctx.db
        .insert(group)
        .values({
          name: input.name,
          description: input.description,
          createdById: userId,
        })
        .returning();
      // add owner to group
      await ctx.db.insert(groupMember).values({
        groupId: newGroup.id,
        userId,
        role: 'owner',
      });
      groupId = newGroup.id;
    }

    // Check if user is the owner of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, userId),
        eq(groupMember.role, 'owner')
      ),
    });

    if (!membership) {
      throw new Error('Only group owners can update group details');
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
      .returning();

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
} satisfies TRPCRouterRecord;
