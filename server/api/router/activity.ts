import type { TRPCRouterRecord } from '@trpc/server';
import { and, desc, eq, lt } from 'drizzle-orm';

import { activity, groupMember } from '~/db/schema';
import { protectedProcedure } from '../trpc';
import { createActivitySchema, groupIdWithPaginationSchema } from '../schema';

export const activityRouter = {
  // Get activity feed for a group
  getByGroupId: protectedProcedure
    .input(groupIdWithPaginationSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member of this group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this group");
      }

      // Build the query conditions
      let conditions = [];

      // Base condition - group ID match
      conditions.push(eq(activity.groupId, input.groupId));

      // Add cursor for pagination if provided
      if (input.cursor) {
        const cursorActivity = await ctx.db.query.activity.findFirst({
          where: eq(activity.id, input.cursor.id),
        });

        if (cursorActivity) {
          conditions.push(lt(activity.createdAt, cursorActivity.createdAt));
        }
      }

      // Combine all conditions with AND
      const whereCondition = and(...conditions);

      // Get activities with user details
      const activities = await ctx.db.query.activity.findMany({
        where: whereCondition,
        orderBy: [desc(activity.createdAt)],
        limit: input.limit,
        with: {
          user: true,
        },
      });

      // Get the next cursor
      const nextCursor =
        activities.length === input.limit ? activities[activities.length - 1].id : undefined;

      return {
        items: activities,
        nextCursor,
      };
    }),

  // Create a new activity
  create: protectedProcedure.input(createActivitySchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is a member of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
    });

    if (!membership) {
      throw new Error("You don't have access to this group");
    }

    // Create the activity
    const [newActivity] = await ctx.db
      .insert(activity)
      .values({
        ...input,
        userId, // Ensure the current user is set as the actor
      })
      .returning();

    return newActivity;
  }),
} satisfies TRPCRouterRecord;
