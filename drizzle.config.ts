import type { Config } from 'drizzle-kit';
import { DATABASE_URL } from './db/client';

export default {
  schema: './db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: { url: DATABASE_URL },
  casing: 'snake_case',
} satisfies Config;
