import { observable } from '@legendapp/state';
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite';
import { configureSynced } from '@legendapp/state/sync';
import { KeelClient, syncedKeel } from '@legendapp/state/sync-plugins/keel';
import Storage from 'expo-sqlite/kv-store';

import { createKeelClient } from './create-keel-client';
import { CustomKSUID } from './custom-ksuid';

import { APIResult, User } from '~/keel/keelClient';

const client = createKeelClient();
const { mutations, queries } = client.api;

// Create a single instance of the realtime plugin

export const isAuthed$ = observable(false);

export function generateKeelId() {
  return CustomKSUID.randomSync().toString();
}

// Global configuration
export const sync = configureSynced(syncedKeel, {
  client: client as KeelClient,
  persist: {
    plugin: observablePersistSqlite(Storage),
    retrySync: true,
  },
  retry: {
    infinite: true,
  },
  // debounceSet: 500,
  // changesSince: 'last-sync', also needs to enable updatedAt? on list function
  waitFor: isAuthed$,
});

export const user$ = observable(
  sync({
    get: () => queries.me() as Promise<APIResult<User>>,
    update: mutations.updateUser,
    delete: mutations.deleteUser,
    persist: {
      name: 'user',
    },
    mode: 'merge',
  })
);

export async function signIn(email: string, password: string) {
  // authenticate the client
  const result = await client.auth.authenticateWithPassword({
    email,
    password,
  });

  // if user signed up, create a user record
  if (result.data?.identityCreated) {
    console.log('identityCreated', result.data.identityCreated);
  }

  // Set isAuthed$ to start syncing
  isAuthed$.set(true);
}

export async function signOut() {
  await client.auth.logout();
  isAuthed$.set(false);
}
