import { relations } from 'drizzle-orm'; // Import relations
import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  doublePrecision,
  index,
} from 'drizzle-orm/pg-core';
import { group } from './group';
import { user } from './auth';
import { timestamps } from '../helper';

//****************************/
//**** SETTLEMENT SCHEMA *******/
//****************************/

export const settlementStatusEnum = pgEnum('settlement_status', ['pending', 'completed']);

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

//****************************/
//**** SETTLEMENT RELATIONS SCHEMA *******/
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
