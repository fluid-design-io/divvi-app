import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '~/db/client';

export const auth = betterAuth({
  trustedOrigins: ['divvi-app://'],
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: 'divvi',
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite', // or "pg" or "mysql"
  }),
});
