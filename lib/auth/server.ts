import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous, oAuthProxy } from 'better-auth/plugins';

import { db } from '~/db/client';
import { linkAccount } from '~/server/functions/link-account';

export const auth = betterAuth({
  trustedOrigins: ['divvi-app://'],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: 'https://divvi-app.uing.dev/api/auth/callback/google',
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      redirectURI: 'https://divvi-app.uing.dev/api/auth/callback/discord',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
      redirectURI: 'https://divvi-app.uing.dev/api/auth/callback/apple',
    },
  },
  plugins: [
    oAuthProxy(),
    expo({
      overrideOrigin: true,
    }),
    anonymous({
      onLinkAccount: linkAccount,
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
