import { pgTable } from 'drizzle-orm/pg-core';

export const Trip = pgTable('trip', (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar(),
  description: t.varchar({ length: 255 }),
}));
