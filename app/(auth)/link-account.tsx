import { Icon } from '@roninoss/icons';
import { Link, router, Stack, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Image, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';
import { useColorScheme } from '~/lib/useColorScheme';
import { useQueryClient } from '@tanstack/react-query';
export default function LinkAccount() {
  const { data: isAuthenticated } = authClient.useSession();
  const navContainerRef = useNavigationContainerRef();
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();
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
        router.replace('/(tabs)/(home)');
      }
    }
  }, [isAuthenticated, navContainerRef.isReady()]);
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <Button
              size="icon"
              variant="plain"
              onPress={() => {
                router.back();
              }}>
              <Icon name="arrow-left" size={24} color={colors.foreground} />
            </Button>
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="flex-1 justify-center py-8">
          <View className="ios:pb-5 ios:pt-8 pb-2">
            <Text className="ios:font-extrabold text-center text-3xl font-medium">
              Link Your Account
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              Link your account so you can use it across all devices.
            </Text>
          </View>
          <View className="flex-1 justify-end gap-8 px-4">
            <View className="mb-4 items-center">
              <Icon
                name="account-multiple"
                size={24}
                color={colors.primary}
                ios={{ renderingMode: 'hierarchical' }}
              />
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
          <View className="gap-4 px-4">
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
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
