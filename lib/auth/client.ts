import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import { anonymousClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';

import { getBaseUrl } from '~/utils/base-url';

export const authClient = createAuthClient({
  baseURL: getBaseUrl() + '/api/auth',
  plugins: [
    anonymousClient(),
    expoClient({
      scheme: 'divvi-app',
      storagePrefix: 'divvi',
      storage: SecureStore,
    }),
  ],
});
