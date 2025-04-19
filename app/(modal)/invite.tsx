import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { Button } from '~/components/nativewindui/Button';
import { Stack } from 'expo-router';
import { COLORS } from '~/theme/colors';
import { authClient } from '~/lib/auth/client';
import Loading from '~/components/core/loading';
import { ErrorView } from '~/components/core/error-view';

export default function Invite() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { data: session, isPending } = authClient.useSession();

  if (!token) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-lg font-semibold">Invalid invite link</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          This invite link appears to be invalid. Please check the URL and try again.
        </Text>
      </View>
    );
  }

  if (isPending) {
    return <Loading expand />;
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-lg font-semibold">Sign in required</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          Please sign in to join this group.
        </Text>
      </View>
    );
  }

  return <JoinGroupView token={token} />;
}

const JoinGroupView = ({ token }: { token: string }) => {
  const router = useRouter();
  const {
    mutate: joinGroup,
    isPending,
    isError,
    error,
  } = useMutation(
    trpc.group.joinByInvite.mutationOptions({
      onSuccess: (data) => {
        router.push(`/group/${data.groupId}`);
      },
    })
  );

  if (isError) return <ErrorView message={error?.message} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Join Group',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: COLORS.light.background,
          },
        }}
      />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-lg font-semibold">Join Group</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          You've been invited to join a group. Click the button below to accept the invitation.
        </Text>

        <Button
          onPress={() => joinGroup({ token })}
          className="mt-6"
          variant="primary"
          disabled={isPending}>
          Join Group
        </Button>
      </View>
    </>
  );
};
