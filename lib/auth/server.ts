import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';

import { db } from '~/db/client';
import { linkAccount } from '~/server/functions/link-account';

export const auth = betterAuth({
  trustedOrigins: ['divvi-app://'],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'discord', 'apple'],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
    },
  },
  plugins: [
    expo(),
    anonymous({
      onLinkAccount: linkAccount,
      emailDomainName: 'divvi-app.uing.dev',
    }),
  ],
  advanced: {
    cookiePrefix: 'divvi',
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  database: drizzleAdapter(db, {
    provider: 'pg', // or "pg" or "mysql"
  }),
  logger: {
    level: 'debug',
  },
});
