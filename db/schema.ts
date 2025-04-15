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

// Groups table
export const group = pgTable(
  'group',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    createdById: text('created_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('group_created_by_id_idx').on(t.createdById)]
);

// Group members table
export const groupMember = pgTable('group_member', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => group.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').notNull().default('member'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// Expenses table
export const expense = pgTable(
  'expense',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Expense'),
    description: text('description'),
    amount: doublePrecision('amount').notNull(),
    paidById: text('paid_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull().defaultNow(),
    splitType: splitTypeEnum('split_type').notNull().default('equal'),
    category: categoryEnum('category').notNull().default('other'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('expense_group_id_idx').on(t.groupId)]
);
// Expense splits (how much each person owes)
export const expenseSplit = pgTable(
  'expense_split',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    expenseId: uuid('expense_id')
      .notNull()
      .references(() => expense.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: doublePrecision('amount').notNull(),
    percentage: doublePrecision('percentage'),
    settled: boolean('settled').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
    id: uuid('id').defaultRandom().primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    fromUserId: text('from_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    toUserId: text('to_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: doublePrecision('amount').notNull(),
    status: settlementStatusEnum('status').notNull().default('pending'),
    settledAt: timestamp('settled_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
    id: uuid('id').defaultRandom().primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    activityType: text('activity_type').notNull(),
    entityId: uuid('entity_id'),
    data: text('data'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('activity_group_id_idx').on(t.groupId), index('activity_user_id_idx').on(t.userId)]
);
