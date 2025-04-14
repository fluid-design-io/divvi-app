import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  trustedOrigins: ['divvi-app://'],
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
});
