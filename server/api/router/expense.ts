import type { TRPCRouterRecord } from '@trpc/server';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import {
  createExpenseWithSplitsSchema,
  updateExpenseSchema,
  groupIdInputSchema,
  groupIdWithTimeframeSchema,
} from '../schema';
import { protectedProcedure } from '../trpc';

import { expense, expenseSplit, group, groupMember } from '~/db/schema';

export const expenseRouter = {
  // Get all expenses for a group
  getByGroupId: protectedProcedure.input(groupIdInputSchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is a member of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
    });

    if (!membership) {
      throw new Error("You don't have access to this group");
    }

    return ctx.db.query.expense.findMany({
      where: eq(expense.groupId, input.groupId),
      orderBy: [desc(expense.date)],
      with: {
        splits: {
          with: {
            user: true,
          },
        },
        paidBy: true,
      },
    });
  }),

  // Get a specific expense by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find the expense
      const expenseRecord = await ctx.db.query.expense.findFirst({
        where: eq(expense.id, input.id),
        with: {
          group: true,
        },
      });

      if (!expenseRecord) {
        throw new Error('Expense not found');
      }

      // Check if user is a member of the expense's group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, expenseRecord.groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this expense");
      }

      return ctx.db.query.expense.findFirst({
        where: eq(expense.id, input.id),
        with: {
          splits: {
            with: {
              user: true,
            },
          },
          paidBy: true,
          group: true,
        },
      });
    }),

  // initalize an expense into "default" group (create if not exists)
  initialize: protectedProcedure.input(z.void()).mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Check if "default" group exists
    let defaultGroup = await ctx.db.query.group.findFirst({
      where: eq(group.name, 'default'),
    });

    if (!defaultGroup) {
      // Create "default" group
      const [newGroup] = await ctx.db
        .insert(group)
        .values({
          name: 'default',
          createdById: userId,
          description: 'Default group for expenses',
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
  }),

  // Create a new expense with splits
  create: protectedProcedure
    .input(createExpenseWithSplitsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member of this group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, input.expense.groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this group");
      }

      // Validate the expense amount and splits
      const totalSplitAmount = input.splits.reduce((sum, split) => sum + split.amount, 0);

      if (Math.abs(totalSplitAmount - input.expense.amount) > 0.01) {
        // Allow small floating point error
        throw new Error('The sum of splits must equal the total expense amount');
      }

      // Create the expense
      const [newExpense] = await ctx.db.insert(expense).values(input.expense).returning();

      // Create the expense splits
      const splitsWithExpenseId = input.splits.map((split) => ({
        ...split,
        expenseId: newExpense.id,
      }));

      const splits = await ctx.db.insert(expenseSplit).values(splitsWithExpenseId).returning();

      return {
        ...newExpense,
        splits,
      };
    }),

  // Update an expense
  update: protectedProcedure.input(updateExpenseSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Get the expense
    const expenseRecord = await ctx.db.query.expense.findFirst({
      where: eq(expense.id, input.id),
    });

    if (!expenseRecord) {
      throw new Error('Expense not found');
    }

    // Check if user created the expense
    if (expenseRecord.paidById !== userId) {
      throw new Error('Only the expense creator can update it');
    }

    // Update expense
    const updateData: Partial<typeof expense.$inferInsert> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.date !== undefined) updateData.date = input.date;
    if (input.splitType !== undefined) updateData.splitType = input.splitType;

    updateData.updatedAt = new Date();

    const [updatedExpense] = await ctx.db
      .update(expense)
      .set(updateData)
      .where(eq(expense.id, input.id))
      .returning();

    // Update splits if provided
    if (input.splits && input.splits.length > 0) {
      // Verify total amount
      const totalSplitAmount = input.splits.reduce((sum, split) => sum + split.amount, 0);

      if (Math.abs(totalSplitAmount - (input.amount || expenseRecord.amount)) > 0.01) {
        throw new Error('The sum of splits must equal the total expense amount');
      }

      // Delete existing splits
      await ctx.db.delete(expenseSplit).where(eq(expenseSplit.expenseId, input.id));

      // Create new splits
      const newSplits = input.splits.map((split) => ({
        expenseId: input.id,
        userId: split.userId,
        amount: split.amount,
        percentage: split.percentage,
      }));

      await ctx.db.insert(expenseSplit).values(newSplits);
    }

    return updatedExpense;
  }),

  // Delete an expense
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the expense
      const expenseRecord = await ctx.db.query.expense.findFirst({
        where: eq(expense.id, input.id),
      });

      if (!expenseRecord) {
        throw new Error('Expense not found');
      }

      // Check if user created the expense
      if (expenseRecord.paidById !== userId) {
        throw new Error('Only the expense creator can delete it');
      }

      // Delete the expense (cascades to splits)
      await ctx.db.delete(expense).where(eq(expense.id, input.id));

      return { success: true };
    }),

  // Get expense summary by category for a group
  getSummaryByCategory: protectedProcedure
    .input(groupIdWithTimeframeSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member of this group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this group");
      }

      // Build time filter
      let timeFilter = sql`TRUE`;
      const now = new Date();

      if (input.timeframe === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        timeFilter = sql`${expense.date} >= ${oneWeekAgo}`;
      } else if (input.timeframe === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        timeFilter = sql`${expense.date} >= ${oneMonthAgo}`;
      } else if (input.timeframe === 'year') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        timeFilter = sql`${expense.date} >= ${oneYearAgo}`;
      }

      // Get summary by category
      const summary = await ctx.db
        .select({
          category: expense.category,
          total: sql<number>`sum(${expense.amount})`.as('total'),
          count: sql<number>`count(*)`.as('count'),
        })
        .from(expense)
        .where(and(eq(expense.groupId, input.groupId), timeFilter))
        .groupBy(expense.category);

      return summary;
    }),

  // Get balances for all users in a group
  getGroupBalances: protectedProcedure.input(groupIdInputSchema).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Check if user is a member of this group
    const membership = await ctx.db.query.groupMember.findFirst({
      where: and(eq(groupMember.groupId, input.groupId), eq(groupMember.userId, userId)),
    });

    if (!membership) {
      throw new Error("You don't have access to this group");
    }

    // Get all group members
    const members = await ctx.db.query.groupMember.findMany({
      where: eq(groupMember.groupId, input.groupId),
      with: {
        user: true,
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
  }),

  // Mark an expense split as settled
  settleSplit: protectedProcedure
    .input(z.object({ splitId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the split
      const split = await ctx.db.query.expenseSplit.findFirst({
        where: eq(expenseSplit.id, input.splitId),
        with: {
          expense: true,
        },
      });

      if (!split) {
        throw new Error('Split not found');
      }

      // Check if the current user is either the one who paid the expense or the one who owes
      if (split.expense && split.expense.paidById !== userId && split.userId !== userId) {
        throw new Error("You don't have permission to settle this split");
      }

      // Mark as settled
      const [updatedSplit] = await ctx.db
        .update(expenseSplit)
        .set({
          settled: true,
          updatedAt: new Date(),
        })
        .where(eq(expenseSplit.id, input.splitId))
        .returning();

      return updatedSplit;
    }),
} satisfies TRPCRouterRecord;
