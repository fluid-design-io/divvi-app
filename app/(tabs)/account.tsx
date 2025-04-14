import { use$ } from '@legendapp/state/react';
import { useEffect, useState } from 'react';
import { Button, ScrollView, TextInput } from 'react-native';

import { createKeelClient } from '~/lib/create-keel-client';
import { isAuthed$, signIn, signOut } from '~/lib/sync';

export default function Home() {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('password');

  const isAuthed = use$(isAuthed$);

  const handleLogin = async () => {
    await signIn(email, password);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    const checkAuth = async () => {
      const client = createKeelClient();
      const isAuthenticated = await client.auth.isAuthenticated();
      if (isAuthenticated.data) {
        // Set isAuthed$ to start syncing
        isAuthed$.set(isAuthenticated.data);
      }
    };
    checkAuth();
  }, []);

  if (!isAuthed) {
    return (
      <ScrollView
        automaticallyAdjustContentInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-6">
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} />
        <Button title="Sign In" onPress={handleLogin} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      automaticallyAdjustContentInsets
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="px-6">
      <Button title="Sign Out" onPress={handleSignOut} />
    </ScrollView>
  );
}
