import { TRPCError, type TRPCRouterRecord } from '@trpc/server';
import { and, desc, eq, sql, or, lt, ilike } from 'drizzle-orm';
import { z } from 'zod';

import {
  groupIdWithPaginationSchema,
  createExpenseSchema,
  groupIdWithTimeframeSchema,
} from '../schema';
import { protectedProcedure } from '../trpc';

import { expense, expenseSplit, group, groupMember } from '~/db/schema';
import { getGroupBalances } from '~/server/functions/get-group-balances';

const EXPENSES_PER_PAGE = 20;

export const expenseRouter = {
  // Get all expenses for a group with pagination
  getByGroupId: protectedProcedure
    .input(groupIdWithPaginationSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input.limit ?? EXPENSES_PER_PAGE;
      const { cursor, groupId, searchTerm } = input;

      // Check if user is a member of this group
      const membership = await ctx.db.query.groupMember.findFirst({
        where: and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)),
      });

      if (!membership) {
        throw new Error("You don't have access to this group's expenses");
      }

      // Build search filter condition
      const searchFilter = searchTerm
        ? or(ilike(expense.title, `%${searchTerm}%`), ilike(expense.description, `%${searchTerm}%`))
        : undefined;

      // Fetch expenses with cursor logic AND search filter
      const items = await ctx.db.query.expense.findMany({
        where: (expenseSchema, { and: andWhere }) =>
          andWhere(
            eq(expenseSchema.groupId, groupId),
            searchFilter,
            cursor
              ? or(
                  lt(expenseSchema.date, cursor.date),
                  and(eq(expenseSchema.date, cursor.date), lt(expenseSchema.id, cursor.id))
                )
              : undefined
          ),
        orderBy: [desc(expense.date), desc(expense.id)],
        limit: limit + 1,
        with: {
          splits: { with: { user: true } },
          paidBy: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        if (nextItem) {
          nextCursor = { date: nextItem.date, id: nextItem.id };
        }
      }

      return {
        items,
        nextCursor,
      };
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
    const defaultGroupName = 'Default Group';

    // Check if "default" group exists
    let defaultGroup = await ctx.db.query.group.findFirst({
      where: eq(group.name, defaultGroupName),
    });

    if (!defaultGroup) {
      // Create "default" group
      const [newGroup] = await ctx.db
        .insert(group)
        .values({
          name: defaultGroupName,
          createdById: userId,
          description: `${defaultGroupName} for expenses`,
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

  // Create an expense - the splits cannot be updated later
  create: protectedProcedure.input(createExpenseSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const { splits, groupId, ...rest } = input;

    if (!groupId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Group ID is required',
      });
    }

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }

    const transaction = await ctx.db.transaction(async (tx) => {
      const [expenseRecord] = await tx
        .insert(expense)
        .values({
          groupId,
          ...rest,
        })
        .returning({ id: expense.id, paidById: expense.paidById, amount: expense.amount });

      if (!expenseRecord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Error creating expense',
        });
      }

      console.log('🔥 Expense created', expenseRecord);

      // Update splits if provided
      if (splits && splits.length > 0) {
        // Verify total amount
        const totalSplitAmount = splits.reduce((sum, split) => sum + (split?.amount ?? 0), 0);

        console.log('🔥 Total split amount', totalSplitAmount);
        console.log('🔥 Expense amount', input.amount);
        console.log('🔥 Expense record amount', expenseRecord.amount);
        if (Math.abs(totalSplitAmount - (input.amount || expenseRecord.amount)) > 0.01) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'The sum of splits must equal the total expense amount',
          });
        }

        console.log('🔥 Creating splits');
        //* Create new splits
        const newSplits = splits.map((split) => ({
          expenseId: expenseRecord.id,
          userId: split.userId,
          amount: split.amount,
          percentage: split.percentage,
        }));

        console.log('🔥 New splits', newSplits);

        if (newSplits.length > 0) {
          await tx.insert(expenseSplit).values(newSplits);
        }
      }

      // Update group's updatedAt
      await tx.update(group).set({ updatedAt: new Date() }).where(eq(group.id, input.groupId!));

      return expenseRecord;
    });

    return transaction;
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
  getGroupBalances: protectedProcedure
    .input(groupIdWithPaginationSchema)
    .query(async ({ ctx, input }) => getGroupBalances(ctx, input)),

  // Mark an expense split as settled
  settleSplit: protectedProcedure
    .input(z.object({ splitId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get the split
      const split = await ctx.db.query.expenseSplit.findFirst({
        where: eq(expenseSplit.id, input.splitId),
        with: {
          expense: {
            columns: {
              id: true,
              paidById: true,
            },
          },
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
