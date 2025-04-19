import { relations } from 'drizzle-orm';
import {
  account,
  session,
  user,
  group,
  groupMember,
  expense,
  expenseSplit,
  settlement,
  activity,
  groupInvite,
} from './tables';

//****************************/
//**** USER RELATIONS *******/
//****************************/

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

//****************************/
//**** SESSION RELATIONS *******/
//****************************/

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

//****************************/
//**** ACCOUNT RELATIONS *******/
//****************************/

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

//****************************/
//**** GROUP RELATIONS *******/
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

export const groupInviteRelations = relations(groupInvite, ({ one }) => ({
  group: one(group, {
    fields: [groupInvite.groupId],
    references: [group.id],
  }),
}));

//****************************/
//**** EXPENSE RELATIONS *******/
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

//****************************/
//**** SETTLEMENT RELATIONS *******/
//****************************/

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

//****************************/
//**** ACTIVITY RELATIONS *******/
//****************************/

export const activityRelations = relations(activity, ({ one }) => ({
  group: one(group, {
    fields: [activity.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [activity.userId],
    references: [user.id],
  }),
}));
