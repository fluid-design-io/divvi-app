import { expense } from '~/db/schema';
import { createTRPCContext } from '../api';
import { groupIdWithPaginationSchema } from '../api/schema';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

/**
 * Get the balances for all users in a group
 * @returns The balances for all users in the group
 */
export const getGroupBalancesTotal = async (
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

  const groupExpenses = await ctx.db.query.expense.findMany({
    where: and(eq(expense.groupId, input.groupId)),
    columns: {
      amount: true,
    },
  });

  // add up the expenses for this group, return the total amount
  const groupBalances = groupExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return groupBalances;
};
