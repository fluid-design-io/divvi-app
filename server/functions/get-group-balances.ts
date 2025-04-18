import { expense, groupMember } from '~/db/schema/app';
import { createTRPCContext } from '../api';
import { groupIdWithPaginationSchema } from '../api/schema';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

/**
 * Get the balances for all users in a group
 * @returns The balances for all users in the group
 */
export const getGroupBalances = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  input: z.infer<typeof groupIdWithPaginationSchema>
) => {
  const userId = ctx.session?.user.id;

  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    });
  }

  // Check if user is a member of this group
  const membership = await ctx.db.query.groupMember.findFirst({
    where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
  });

  if (!membership) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: "You don't have access to this group",
    });
  }

  // Get all group members
  const members = await ctx.db.query.groupMember.findMany({
    where: eq(groupMember.groupId, input.groupId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Initialize balances for each user
  const balances: Record<string, number> = {};
  for (const member of members) {
    balances[member.userId] = 0;
  }

  // Get all expenses for this group
  const expenses = await ctx.db.query.expense.findMany({
    where: eq(expense.groupId, input.groupId),
    with: {
      splits: true,
    },
  });

  // Calculate balances
  for (const exp of expenses) {
    // The person who paid gets credit
    balances[exp.paidById] += exp.amount;

    // Everyone who owes pays
    if (exp.splits) {
      for (const split of exp.splits) {
        balances[split.userId] -= split.amount;
      }
    }
  }

  // Format the response with user details
  return members.map((member) => ({
    userId: member.userId,
    name: member.user?.name || 'Unknown User',
    balance: balances[member.userId],
  }));
};
