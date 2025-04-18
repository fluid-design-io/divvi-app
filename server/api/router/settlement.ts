import type { TRPCRouterRecord } from '@trpc/server';
import { z } from 'zod';
import { and, desc, eq, or } from 'drizzle-orm';

import { settlement, groupMember } from '~/db/schema';
import { protectedProcedure } from '../trpc';
import { createSettlementSchema, groupIdInputSchema, settlementStatusValues } from '../schema';

export const settlementRouter = {
  // Get all settlements for a group
  getByGroupId: protectedProcedure.input(groupIdInputSchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is a member of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
    });

    if (!membership) {
      throw new Error("You don't have access to this group");
    }

    return ctx.db.query.settlement.findMany({
      where: eq(settlement.groupId, input.groupId),
      orderBy: [desc(settlement.createdAt)],
      with: {
        fromUser: true,
        toUser: true,
      },
    });
  }),

  // Get settlements where the current user is involved
  getMySettlements: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        status: z.enum(settlementStatusValues).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member of this group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this group");
      }

      // Build the where condition
      let whereCondition = and(
        eq(settlement.groupId, input.groupId),
        or(eq(settlement.fromUserId, userId), eq(settlement.toUserId, userId))
      );

      // Add status filter if provided
      if (input.status) {
        whereCondition = and(whereCondition, eq(settlement.status, input.status));
      }

      return ctx.db.query.settlement.findMany({
        where: whereCondition,
        orderBy: [desc(settlement.createdAt)],
        with: {
          fromUser: true,
          toUser: true,
        },
      });
    }),

  // Create a new settlement
  create: protectedProcedure.input(createSettlementSchema).mutation(async ({ ctx, input }) => {
    // Check if both users are members of the group
    const memberships = await ctx.db.query.groupMember.findMany({
      where: and(
        eq(groupMember.groupId, input.groupId),
        or(eq(groupMember.userId, input.fromUserId), eq(groupMember.userId, input.toUserId))
      ),
    });

    // Ensure both users are members
    const uniqueUserIds = new Set(memberships.map((m) => m.userId));
    if (uniqueUserIds.size !== 2) {
      throw new Error('Both users must be members of the group');
    }

    // Create the settlement with pending status
    const [newSettlement] = await ctx.db
      .insert(settlement)
      .values({
        ...input,
        status: 'pending',
      })
      .returning();

    return newSettlement;
  }),

  // Mark a settlement as completed
  markAsCompleted: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the settlement
      const settlementRecord = await ctx.db.query.settlement.findFirst({
        where: eq(settlement.id, input.id),
      });

      if (!settlementRecord) {
        throw new Error('Settlement not found');
      }

      // Only the user who owes can mark as completed
      if (settlementRecord.fromUserId !== userId) {
        throw new Error('Only the user who owes can mark the settlement as completed');
      }

      // Mark as completed and set settled date
      const [updatedSettlement] = await ctx.db
        .update(settlement)
        .set({
          status: 'completed',
          settledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(settlement.id, input.id))
        .returning();

      return updatedSettlement;
    }),

  // Delete a settlement
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the settlement
      const settlementRecord = await ctx.db.query.settlement.findFirst({
        where: eq(settlement.id, input.id),
      });

      if (!settlementRecord) {
        throw new Error('Settlement not found');
      }

      // Check if user is involved in the settlement
      if (settlementRecord.fromUserId !== userId && settlementRecord.toUserId !== userId) {
        throw new Error("You don't have permission to delete this settlement");
      }

      // Only allow deleting pending settlements
      if (settlementRecord.status === 'completed') {
        throw new Error('Cannot delete a completed settlement');
      }

      // Delete the settlement
      await ctx.db.delete(settlement).where(eq(settlement.id, input.id));

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
