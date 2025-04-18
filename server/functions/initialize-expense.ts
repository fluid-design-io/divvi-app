import { expense, group, groupMember } from '~/db/schema';
import { createTRPCContext } from '../api';
import { upsertExpenseSchema } from '../api/schema';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const DEFAULT_GROUP_NAME = 'Default Group';

/**
 * Initialize a new expense
 * @returns The new expense
 */
export const initializeExpense = async (ctx: Awaited<ReturnType<typeof createTRPCContext>>) => {
  const userId = ctx.session!.user.id;

  // Check if "default" group exists
  let defaultGroup = await ctx.db.query.group.findFirst({
    where: eq(group.name, DEFAULT_GROUP_NAME),
  });

  if (!defaultGroup) {
    // Create "default" group
    const [newGroup] = await ctx.db
      .insert(group)
      .values({
        name: DEFAULT_GROUP_NAME,
        createdById: userId,
        description: `${DEFAULT_GROUP_NAME} for expenses`,
      })
      .returning();

    // Create group member for the user
    await ctx.db.insert(groupMember).values({
      userId,
      role: 'owner',
      groupId: newGroup.id,
    });

    defaultGroup = newGroup;
  }
  // create a new expense in the default group
  const [newExpense] = await ctx.db
    .insert(expense)
    .values({
      title: 'New Expense',
      amount: 0,
      groupId: defaultGroup.id,
      paidById: userId,
    })
    .returning();

  return newExpense;
};
