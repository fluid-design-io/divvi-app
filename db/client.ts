import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema/index';

const isProd = process.env.PROD === 'true';
export const DATABASE_URL = isProd ? process.env.PROD_DATABASE_URL! : process.env.DATABASE_URL!;

if (isProd) console.log('🚨 Using production database');

export const db = drizzle({
  connection: {
    connectionString: DATABASE_URL,
  },
  casing: 'snake_case',
  schema: {
    ...schema,
  },
});
