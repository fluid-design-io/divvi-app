import { relations } from 'drizzle-orm';
import { account, session, user } from './auth';
import { group, groupMember } from './group';
import { expense } from './expense';
import { expenseSplit } from './expense';
import { settlement } from './settlement';
import { activity } from './activity';

//****************************/
//**** RELATIONS SCHEMA *******/
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
