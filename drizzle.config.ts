import type { Config } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing Database Url');
}
const isProd = process.env.PROD === 'true';
const dbUrl = isProd ? process.env.PROD_DATABASE_URL! : process.env.DATABASE_URL;

if (isProd) console.log('🚨 Using production database');

export default {
  schema: './db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: { url: dbUrl },
  casing: 'snake_case',
} satisfies Config;
