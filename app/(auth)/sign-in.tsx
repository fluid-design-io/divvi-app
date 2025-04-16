import { router, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';

export default function SignIn() {
  const { data: isAuthenticated } = authClient.useSession();
  const navContainerRef = useNavigationContainerRef();

  const handleLogin = async (provider: 'google' | 'discord') => {
    const res = await authClient.signIn.social(
      {
        provider,
        callbackURL: '/two',
      },
      {
        onRequest: (request) => {
          console.log('request', JSON.stringify(request, null, 2));
        },
        onResponse: (response) => {
          console.log('response', JSON.stringify(response, null, 2));
        },
        onError: (error) => {
          console.log('error', JSON.stringify(error, null, 2));
        },
      }
    );
    if (res.error) {
      Alert.alert('Error', res.error.message);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      if (navContainerRef.isReady()) {
        router.push('/(tabs)/(home)');
      }
    }
  }, [isAuthenticated, navContainerRef.isReady()]);
  return (
    <>
      <Button onPress={() => handleLogin('google')}>
        <Text>Login with Google</Text>
      </Button>
      <Button onPress={() => handleLogin('discord')}>
        <Text>Login with Discord</Text>
      </Button>
    </>
  );
}
