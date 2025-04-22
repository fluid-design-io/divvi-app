import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  doublePrecision,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../helper';
import { addDays } from 'date-fns';
import { sql } from 'drizzle-orm';

//****************************/
//**** ENUMS *******/
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
export const memberRoleEnum = pgEnum('member_role', ['owner', 'member']);

//****************************/
//**** USER & AUTH TABLES *******/
//****************************/

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  isAnonymous: boolean('is_anonymous'),
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
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
//**** GROUP TABLES *******/
//****************************/

export const group = pgTable(
  'group',
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    description: text(),
    createdById: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    ...timestamps,
  },
  (t) => [index('group_created_by_id_idx').on(t.createdById)]
);

export const groupMember = pgTable('group_member', {
  id: uuid().defaultRandom().primaryKey(),
  groupId: uuid()
    .notNull()
    .references(() => group.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  role: memberRoleEnum().notNull().default('member'),
  joinedAt: timestamp().notNull().defaultNow(),
});

// A link that can be sent to a user to join a group
export const groupInvite = pgTable(
  'group_invite',
  {
    id: uuid().defaultRandom().primaryKey(),
    groupId: uuid()
      .notNull()
      .references(() => group.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    token: text()
      .notNull()
      .default(sql`gen_random_uuid()`)
      .unique(),
    expiresAt: timestamp()
      .notNull()
      .$defaultFn(() => addDays(new Date(), 7)),
    ...timestamps,
  },
  (t) => [index('group_invite_token_idx').on(t.token)]
);

//****************************/
//**** EXPENSE TABLES *******/
//****************************/

export const expense = pgTable(
  'expense',
  {
    id: uuid().defaultRandom().primaryKey(),
    groupId: uuid()
      .notNull()
      .references(() => group.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    title: text().notNull().default('Expense'),
    description: text(),
    amount: doublePrecision().notNull(),
    paidById: text() // The user who paid for the expense
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    date: timestamp().notNull().defaultNow(),
    splitType: splitTypeEnum().notNull().default('equal'),
    category: categoryEnum().notNull().default('other'),
    ...timestamps,
  },
  (t) => [index('expense_group_id_idx').on(t.groupId)]
);

export const expenseSplit = pgTable(
  'expense_split',
  {
    id: uuid().defaultRandom().primaryKey(),
    expenseId: uuid()
      .notNull()
      .references(() => expense.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
//**** SETTLEMENT TABLES *******/
//****************************/
export const settlement = pgTable(
  'settlement',
  {
    id: uuid().defaultRandom().primaryKey(),
    groupId: uuid()
      .notNull()
      .references(() => group.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    fromUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    toUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    amount: doublePrecision().notNull(),
    settledAt: timestamp(),
    ...timestamps,
  },
  (t) => [
    index('settlement_group_id_idx').on(t.groupId),
    index('settlement_from_user_id_idx').on(t.fromUserId),
    index('settlement_to_user_id_idx').on(t.toUserId),
  ]
);
