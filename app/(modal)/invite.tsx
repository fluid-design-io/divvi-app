import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useMutation, useQuery } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { Button } from '~/components/nativewindui/Button';
import { Stack } from 'expo-router';
import { authClient } from '~/lib/auth/client';
import Loading from '~/components/core/loading';
import { ErrorView } from '~/components/core/error-view';
import { cn } from '~/lib/cn';
import { UserPlus2 } from 'lucide-react-native';
import { TonalIcon } from '~/components/core/icon';
import { SelectGroupCard, SelectGroupCardPending } from '~/components/screen/group';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { data: joinGroupData, isPending: isJoinGroupDataPending } = useQuery(
    trpc.group.getByInviteToken.queryOptions({ token })
  );
  const {
    mutate: joinGroup,
    isPending: isJoinGroupPending,
    isError,
    error,
  } = useMutation(
    trpc.group.joinByInvite.mutationOptions({
      onSuccess: (data) => {
        router.dismissTo(`/group/${data.groupId}`);
      },
    })
  );

  if (isError) return <ErrorView message={error?.message} />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Join Group',
          headerShown: false,
        }}
      />
      <SafeAreaView className="mt-6 flex-1 justify-between px-4" edges={['top', 'bottom']}>
        {isJoinGroupDataPending || !joinGroupData ? (
          <SelectGroupCardPending />
        ) : (
          <SelectGroupCard
            group={{
              id: joinGroupData?.id,
              name: joinGroupData?.name,
              description: joinGroupData?.description ?? '',
            }}
            showIcon={false}
          />
        )}
        <View className="flex-1 items-center justify-center">
          <View className={cn('mx-auto w-full max-w-lg', 'web:rounded-2xl web:bg-card web:p-6')}>
            <View className="items-center justify-center">
              <TonalIcon Icon={UserPlus2} />
            </View>
            <View className="mb-6 gap-2">
              <Text variant="title1" className={cn('ios:font-bold pt-4 text-center')}>
                Join Group
              </Text>
              <Text variant="body" className="px-8 text-center text-muted-foreground">
                You've been invited to join a group. Click the button below to accept the
                invitation.
              </Text>
            </View>
          </View>
        </View>
        <Button
          onPress={() => joinGroup({ token })}
          className="mb-6"
          variant="primary"
          size="lg"
          disabled={isJoinGroupPending}>
          {isJoinGroupPending ? (
            <Loading variant="button" color="white" />
          ) : (
            <Text className="text-center font-rounded text-lg font-semibold">Join Group</Text>
          )}
        </Button>
      </SafeAreaView>
    </>
  );
};
