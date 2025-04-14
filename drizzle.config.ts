import type { Config } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing Database Url');
}

export default {
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
  casing: 'snake_case',
} satisfies Config;
