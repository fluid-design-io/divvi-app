import type { TRPCRouterRecord } from '@trpc/server';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
  groupIdInputSchema,
} from '../schema';
import { protectedProcedure } from '../trpc';

import { expense, group, groupMember } from '~/db/schema';

export const groupRouter = {
  // Get all groups the current user is a member of
  all: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.query.group.findMany({
      where: (group, { exists }) =>
        exists(
          ctx.db
            .select()
            .from(groupMember)
            .where(and(eq(groupMember.groupId, group.id), eq(groupMember.userId, userId)))
        ),
      orderBy: [desc(group.createdAt)],
    });
  }),
  getGroupExpensesCount: protectedProcedure
    .input(groupIdInputSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          count: count(),
        })
        .from(expense)
        .where(eq(expense.groupId, input.groupId));
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

  // Update a group
  update: protectedProcedure.input(updateGroupSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is the owner of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(
        eq(groupMember.groupId, input.id),
        eq(groupMember.userId, userId),
        eq(groupMember.role, 'owner')
      ),
    });

    if (!membership) {
      throw new Error('Only group owners can update group details');
    }

    // Update the group
    const [updatedGroup] = await ctx.db
      .update(group)
      .set({
        name: input.name,
        description: input.description,
        updatedAt: new Date(),
      })
      .where(eq(group.id, input.id))
      .returning();

    return updatedGroup;
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
