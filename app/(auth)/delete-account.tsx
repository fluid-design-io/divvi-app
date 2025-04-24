import { View, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { Icon } from '@roninoss/icons';
import { useColorScheme } from '~/lib/useColorScheme';
import { authClient } from '~/lib/auth/client';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
export default function DeleteAccount() {
  const { colors } = useColorScheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await authClient.deleteUser();
              await queryClient.invalidateQueries();
              router.replace('/(auth)/sign-in');
              // User will be automatically logged out after deletion
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again later.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => (
            <Button size="icon" variant="plain" onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} color={colors.primary} />
            </Button>
          ),
          headerTransparent: true,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="mt-8 flex-1 justify-between p-6">
          <View>
            <Text variant="title1" className="mb-4 font-bold">
              Delete Your Account
            </Text>
            <Text variant="body" className="text-muted-foreground">
              We're sorry to see you go. Before you proceed, please read the following information
              carefully.
            </Text>
            <View className="mt-8 gap-6">
              <View className="bg-destructive/10 rounded-lg p-4">
                <Text variant="heading" className="mb-2">
                  Important Information
                </Text>
                <Text variant="body" className="text-foreground/80">
                  • All your data will be permanently deleted and cannot be recovered
                </Text>
                <Text variant="body" className="text-foreground/80">
                  • No user information will be stored after deletion
                </Text>
                <Text variant="body" className="text-foreground/80">
                  • Account deletion process will be completed within 24 hours
                </Text>
                <Text variant="body" className="text-foreground/80">
                  • You will be automatically logged out after the deletion is complete
                </Text>
              </View>
            </View>
          </View>
          <Button
            variant="primary"
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            className="mt-8 bg-destructive">
            <Text variant="body" className="text-destructive-foreground">
              {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}
