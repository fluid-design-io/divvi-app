import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import superjson from 'superjson';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { getBaseUrl } from './base-url';

import { authClient } from '~/lib/auth/client';
import type { AppRouter } from '~/server/api';

// Create a custom storage adapter that uses AsyncStorage for non-sensitive data
// and SecureStore for sensitive data
const createStorageAdapter = () => {
  return {
    getItem: async (key: string) => {
      try {
        // Try to get from SecureStore first (for sensitive data)
        const secureValue = await SecureStore.getItemAsync(key);
        if (secureValue) return secureValue;

        // Fall back to AsyncStorage
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        // Determine if this is sensitive data based on the key
        const isSensitive = key.includes('auth') || key.includes('user') || key.includes('expense');

        if (isSensitive) {
          await SecureStore.setItemAsync(key, value);
        } else {
          await AsyncStorage.setItem(key, value);
        }
      } catch (error) {
        console.error('Error writing to storage:', error);
      }
    },
    removeItem: async (key: string) => {
      try {
        // Try both storage systems
        await SecureStore.deleteItemAsync(key);
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from storage:', error);
      }
    },
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: false,
    },
  },
});

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
        colorMode: 'ansi',
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          const headers = new Map<string, string>();
          const cookies = authClient.getCookie();
          if (cookies) {
            headers.set('Cookie', cookies);
            headers.set('x-trpc-source', 'expo-react');
          }
          return Object.fromEntries(headers);
        },
      }),
    ],
  }),
  queryClient,
});

// Helper function to create a persisted query
export const createPersistedQuery = (options: {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  retryDelay?: (attemptIndex: number) => number;
  refetchOnWindowFocus?: boolean | 'always' | 'focus' | 'blur';
  refetchOnReconnect?: boolean;
}) => {
  return {
    ...options,
    persister: {
      storage: createStorageAdapter(),
    },
  };
};

export { type RouterInputs, type RouterOutputs } from '~/server/api';
