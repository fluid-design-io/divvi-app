import { Link, router, useNavigationContainerRef } from 'expo-router';
import * as React from 'react';
import { Alert, Image, Platform, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';
import { useColorScheme } from '~/lib/useColorScheme';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCompactDevice } from '~/hooks/use-is-compact-device';
export default function AuthIndexScreen() {
  const queryClient = useQueryClient();
  const { data: isAuthenticated } = authClient.useSession();
  const navContainerRef = useNavigationContainerRef();
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isCompact = useIsCompactDevice();

  const handleLogin = async (provider: 'google' | 'discord' | 'apple') => {
    queryClient.invalidateQueries();
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
          console.error(`🔥 Sign in error with ${provider}`, JSON.stringify(error, null, 2));
        },
      }
    );
    if (res.error) {
      console.error(`🔥 Sign in error with ${provider}`, JSON.stringify(res.error, null, 2));
      Alert.alert(`Error signing in with ${provider}`, res.error.message);
    }
  };
  const handleAnonymousLogin = async () => {
    const res = await authClient.signIn.anonymous();
    if (res.error) {
      Alert.alert('Error', res.error.message);
    }
  };
  React.useEffect(() => {
    if (isAuthenticated) {
      if (navContainerRef.isReady()) {
        router.replace('/(tabs)/(home)');
      }
    }
  }, [isAuthenticated, navContainerRef.isReady()]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View
          className="bg-muted/50 dark:bg-[#9FCA2C]"
          style={{
            paddingTop: insets.top + 24,
            paddingBottom: 24,
          }}>
          {isDarkColorScheme ? (
            <Image
              source={require('~/assets/images/welcome-dark.png')}
              resizeMode="contain"
              style={{
                height: isCompact ? 160 : 240,
                width: '100%',
              }}
            />
          ) : (
            <Image
              source={require('~/assets/images/welcome-light.png')}
              resizeMode="contain"
              style={{
                height: isCompact ? 160 : 240,
                width: '100%',
              }}
            />
          )}
        </View>
        <View className="ios:justify-end flex-1 justify-center gap-4 px-8 py-4">
          <View className="items-center">
            <Image
              source={require('~/assets/images/logo.png')}
              resizeMode="contain"
              style={{
                height: isCompact ? 32 : 48,
                width: isCompact ? 32 : 48,
              }}
            />
          </View>
          {isCompact ? (
            <View className="mb-4">
              <Text className="text-center text-2xl font-extrabold">
                Split Your Bills with Divvi
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              <Text className="ios:font-extrabold text-center text-3xl font-medium">
                Split Your Bills
              </Text>
              <Text className="ios:font-extrabold text-center text-3xl font-medium">
                with Divvi
              </Text>
            </View>
          )}

          <Button
            variant="secondary"
            className="ios:border-foreground/60"
            size={Platform.select({ ios: 'lg', default: 'md' })}
            onPress={() => handleLogin('google')}>
            <Image
              source={require('~/assets/images/sign-in/google.png')}
              className="absolute left-4 h-4 w-4"
              resizeMode="contain"
            />
            <Text className="ios:text-foreground">Continue with Google</Text>
          </Button>
          <Button
            variant="secondary"
            className="ios:border-foreground/60"
            size={Platform.select({ ios: 'lg', default: 'md' })}
            onPress={() => handleLogin('discord')}>
            <Image
              source={require('~/assets/images/sign-in/discord.png')}
              className="absolute left-4 h-4 w-4"
              resizeMode="contain"
            />
            <Text className="ios:text-foreground">Continue with Discord</Text>
          </Button>
          {Platform.OS === 'ios' && (
            <Button
              variant="secondary"
              className="ios:border-foreground/60"
              size={Platform.select({ ios: 'lg', default: 'md' })}
              onPress={() => handleLogin('apple')}>
              <Text className="ios:text-foreground absolute left-4 text-[22px]"></Text>
              <Text className="ios:text-foreground">Continue with Apple</Text>
            </Button>
          )}

          <Button
            size={Platform.select({ ios: 'lg', default: 'md' })}
            onPress={handleAnonymousLogin}>
            <Text>Sign in as Guest</Text>
          </Button>
          <View className="items-center">
            <Text variant="caption2" className="pt-1 text-center">
              By pressing continue, you agree to our{' '}
              <Link href="/(aux)/terms-of-use">
                <Text variant="caption2" className="text-primary">
                  Terms of Service
                </Text>
              </Link>{' '}
              and that you have read our{' '}
              <Link href="/(aux)/privacy-policy">
                <Text variant="caption2" className="text-primary">
                  Privacy Policy
                </Text>
              </Link>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
