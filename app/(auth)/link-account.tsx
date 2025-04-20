import { router, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { Alert, View } from 'react-native';
import GoogleSignInButton from '~/components/core/sign-in/google-sign-in-button';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';

export default function SignIn() {
  const { data: isAuthenticated } = authClient.useSession();
  const navContainerRef = useNavigationContainerRef();

  const handleLogin = async (provider: 'google' | 'discord' | 'apple') => {
    const res = await authClient.signIn.social(
      {
        provider,
        callbackURL: 'divvi-app://',
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

  // Redirect to home screen if user is authenticated and not anonymous
  useEffect(() => {
    if (isAuthenticated && !isAuthenticated.user.isAnonymous) {
      if (navContainerRef.isReady()) {
        router.push('/(tabs)/(home)');
      }
    }
  }, [isAuthenticated, navContainerRef.isReady()]);
  return (
    <View className="gap-4 px-4">
      <GoogleSignInButton onPress={() => handleLogin('google')} />

      <Button onPress={() => handleLogin('discord')}>
        <Text>Sign in with Discord</Text>
      </Button>
      <Button onPress={() => handleLogin('apple')}>
        <Text>Sign in with Apple</Text>
      </Button>
    </View>
  );
}
