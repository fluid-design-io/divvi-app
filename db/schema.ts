import { relations, sql } from 'drizzle-orm'; // Import relations
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

//****************************/
//**** BETTER AUTH SCHEMA ****/
//****************************/
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

//****************************/
//**** MAIN SCHEMA *******/
//****************************/

// Enum for split types
export const splitTypeEnum = pgEnum('split_type', ['equal', 'percentage', 'exact']);

// Enum for member roles
export const memberRoleEnum = pgEnum('member_role', ['owner', 'member']);

// Enum for category
export const categoryEnum = pgEnum('category', [
  'food',
  'transport',
  'accommodation',
  'entertainment',
  'shopping',
  'utilities',
  'other',
]);

// Enum for settlement status
export const settlementStatusEnum = pgEnum('settlement_status', ['pending', 'completed']);

// Helper for timestamps
const timestamps = {
  createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
};

// Groups table
export const group = pgTable(
  'group',
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    description: text(),
    createdById: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [index('group_created_by_id_idx').on(t.createdById)]
);

// Group members table
export const groupMember = pgTable('group_member', {
  id: uuid().defaultRandom().primaryKey(),
  groupId: uuid()
    .notNull()
    .references(() => group.id, { onDelete: 'cascade' }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: memberRoleEnum().notNull().default('member'),
  joinedAt: timestamp().notNull().defaultNow(),
});

// Expenses table
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
// Settlements between users
export const settlement = pgTable(
  'settlement',
  {
    id: uuid().defaultRandom().primaryKey(),
    groupId: uuid()
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    fromUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    toUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: doublePrecision().notNull(),
    status: settlementStatusEnum().notNull().default('pending'),
    settledAt: timestamp(),
    ...timestamps,
  },
  (t) => [
    index('settlement_group_id_idx').on(t.groupId),
    index('settlement_from_user_id_idx').on(t.fromUserId),
    index('settlement_to_user_id_idx').on(t.toUserId),
  ]
);
// For activity feed and notifications
export const activity = pgTable(
  'activity',
  {
    id: uuid().defaultRandom().primaryKey(),
    groupId: uuid()
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    activityType: text().notNull(),
    entityId: uuid(),
    data: text(),
    ...timestamps,
  },
  (t) => [index('activity_group_id_idx').on(t.groupId), index('activity_user_id_idx').on(t.userId)]
);

// ============================
// Relations Definitions (ADD THIS SECTION)
// ============================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  groupsCreated: many(group), // User can create many groups
  groupMemberships: many(groupMember), // User can be member of many groups
  expensesPaid: many(expense), // User can pay for many expenses
  expenseSplitsOwed: many(expenseSplit), // User can owe splits in many expenses
  settlementsSent: many(settlement, { relationName: 'settlementsSent' }), // Explicit relation name needed for multiple relations to same table
  settlementsReceived: many(settlement, { relationName: 'settlementsReceived' }),
  activities: many(activity),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const groupRelations = relations(group, ({ one, many }) => ({
  creator: one(user, {
    fields: [group.createdById],
    references: [user.id],
  }),
  members: many(groupMember), // A group has many members
  expenses: many(expense), // A group has many expenses
  settlements: many(settlement), // A group has many settlements
  activities: many(activity), // A group has many activities
}));

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [groupMember.userId],
    references: [user.id],
  }),
}));

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

export const settlementRelations = relations(settlement, ({ one }) => ({
  group: one(group, {
    fields: [settlement.groupId],
    references: [group.id],
  }),
  fromUser: one(user, {
    fields: [settlement.fromUserId],
    references: [user.id],
    relationName: 'settlementsSent', // Match the relation name in userRelations
  }),
  toUser: one(user, {
    fields: [settlement.toUserId],
    references: [user.id],
    relationName: 'settlementsReceived', // Match the relation name in userRelations
  }),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  group: one(group, {
    fields: [activity.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [activity.userId],
    references: [user.id],
  }),
  // Note: Linking activity.entityId to specific tables (expense, settlement, etc.)
  // usually requires more complex setup or handling at the application level,
  // as Drizzle relations typically link to a single table based on foreign keys.
}));
