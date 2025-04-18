import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';

// Helper for timestamps
export const timestamps = {
  createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
};
