import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { Button } from '~/components/Button';
import { authClient } from '~/lib/auth/client';

export default function SignIn() {
  const { data } = authClient.useSession();
  const handleLogin = async (provider: 'google' | 'discord') => {
    const res = await authClient.signIn.social({
      provider,
      callbackURL: '/two',
    });
    if (res.error) {
      Alert.alert('Error', res.error.message);
    }
  };
  useEffect(() => {
    if (data?.session) {
      router.replace('/');
    }
  }, [data]);
  return (
    <>
      <Button title="Login with Google" onPress={() => handleLogin('google')} />
      <Button title="Login with Discord" onPress={() => handleLogin('discord')} />
    </>
  );
}
