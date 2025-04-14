import Storage from 'expo-sqlite/kv-store';

import { getBaseUrl } from './base-url';

import { APIClient } from '~/keel/keelClient';
// It's generally better to load environment variables at runtime for flexibility,
// especially in Expo where process.env might behave differently across platforms.
// We'll adjust this when setting up the auth client and Legend State.

// For now, let's define a function to create the client.
// We'll handle the environment variable loading later.

export const createKeelClient = () => {
  const apiUrl = getBaseUrl();

  console.log('🟢 apiUrl', apiUrl);

  const client = new APIClient({
    baseUrl: apiUrl,
    accessTokenStore: {
      get: () => {
        return Storage.getItemSync('accessToken');
      },
      set: (token) => {
        Storage.setItemSync('accessToken', token ?? '');
      },
    },
    refreshTokenStore: {
      get: () => {
        return Storage.getItemSync('refreshToken');
      },
      set: (token) => {
        Storage.setItemSync('refreshToken', token ?? '');
      },
    },
  });

  return client;
};
