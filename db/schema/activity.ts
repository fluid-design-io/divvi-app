import { relations } from 'drizzle-orm'; // Import relations
import { pgTable, text, uuid, index } from 'drizzle-orm/pg-core';
import { group } from './group';
import { user } from './auth';
import { timestamps } from './root';

//****************************/
//**** ACTIVITY SCHEMA *******/
//****************************/

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

//****************************/
//**** ACTIVITY RELATIONS SCHEMA *******/
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
  // Note: Linking activity.entityId to specific tables (expense, settlement, etc.)
  // usually requires more complex setup or handling at the application level,
  // as Drizzle relations typically link to a single table based on foreign keys.
}));
