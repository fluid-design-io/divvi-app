import { relations } from 'drizzle-orm'; // Import relations
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  pgEnum,
  doublePrecision,
  index,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../helper';
import { group } from './group';
import { user } from './auth';

//****************************/
//**** EXPENSE SCHEMA *******/
//****************************/
export const splitTypeEnum = pgEnum('split_type', ['equal', 'percentage', 'exact']);

export const categoryEnum = pgEnum('category', [
  'food',
  'transport',
  'accommodation',
  'entertainment',
  'shopping',
  'utilities',
  'other',
]);

export const expense = pgTable(
  'expense',
  {
    id: uuid().defaultRandom().primaryKey(),
    groupId: uuid()
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    title: text().notNull().default('Expense'),
    description: text(),
    amount: doublePrecision().notNull(),
    paidById: text() // The user who paid for the expense
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    date: timestamp().notNull().defaultNow(),
    splitType: splitTypeEnum().notNull().default('equal'),
    category: categoryEnum().notNull().default('other'),
    ...timestamps,
  },
  (t) => [index('expense_group_id_idx').on(t.groupId)]
);
// Expense splits (how much each person owes)
export const expenseSplit = pgTable(
  'expense_split',
  {
    id: uuid().defaultRandom().primaryKey(),
    expenseId: uuid()
      .notNull()
      .references(() => expense.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: doublePrecision().notNull(),
    percentage: doublePrecision(),
    settled: boolean().notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index('expense_split_expense_id_idx').on(t.expenseId),
    index('expense_split_user_id_idx').on(t.userId),
  ]
);

//****************************/
//**** EXPENSE RELATIONS SCHEMA *******/
//****************************/

export const expenseRelations = relations(expense, ({ one, many }) => ({
  group: one(group, {
    fields: [expense.groupId],
    references: [group.id],
  }),
  paidBy: one(user, {
    // The user who paid
    fields: [expense.paidById],
    references: [user.id],
  }),
  splits: many(expenseSplit), // An expense has many splits
}));

export const expenseSplitRelations = relations(expenseSplit, ({ one }) => ({
  expense: one(expense, {
    fields: [expenseSplit.expenseId],
    references: [expense.id],
  }),
  user: one(user, {
    // The user who owes this split
    fields: [expenseSplit.userId],
    references: [user.id],
  }),
}));
