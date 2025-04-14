import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  // baseURL: getBaseUrl() + '/api/auth',
  baseURL: 'https://deadly-events-vacancies-sum.trycloudflare.com',
  plugins: [
    expoClient({
      scheme: 'divvi-app',
      storagePrefix: 'divvi',
      storage: SecureStore,
    }),
  ],
});
