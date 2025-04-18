import { relations } from 'drizzle-orm'; // Import relations
import { pgTable, text, timestamp, uuid, pgEnum, index } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { timestamps } from '../helper';
import { expense } from './expense';
import { settlement } from './settlement';
import { activity } from './activity';

//****************************/
//**** GROUP SCHEMA *******/
//****************************/

export const memberRoleEnum = pgEnum('member_role', ['owner', 'member']);

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

//****************************/
//**** GROUP RELATIONS SCHEMA *******/
//****************************/

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
