import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useLocalSearchParams } from 'expo-router';
import { Sheet } from '~/components/nativewindui/Sheet';
import { Text } from '~/components/nativewindui/Text';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import Loading from '~/components/core/loading';
import { View, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/components/nativewindui/Button';
import { TonalIcon } from '~/components/core/icon';
import { UserPlus2 } from 'lucide-react-native';
import { cn } from '~/lib/cn';
import QRCode from 'react-native-qrcode-svg';
import { useColorScheme } from '~/lib/useColorScheme';

export const InviteMemberSheet = ({
  onDismiss,
  ref,
}: {
  onDismiss: () => void;
  ref: React.RefObject<BottomSheetModal | null>;
}) => {
  return (
    <Sheet ref={ref} onDismiss={onDismiss} enableDynamicSizing>
      <BottomSheetView>
        <InviteLink />
      </BottomSheetView>
    </Sheet>
  );
};

const InviteLink = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();

  // Query to get the invite link
  const { data: inviteData, isPending: isInvitePending } = useQuery(
    trpc.group.getInviteLink.queryOptions({ groupId }, { enabled: !!groupId })
  );

  // Mutation to generate a new invite link
  const { mutate: generateInvite, isPending: isGeneratingInvite } = useMutation(
    trpc.group.generateInviteLink.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.group.getInviteLink.queryKey({ groupId }),
        });
      },
    })
  );

  // Mutation to deactivate the invite link
  const { mutate: deactivateInvite, isPending: isDeactivatingInvite } = useMutation(
    trpc.group.deactivateInviteLink.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.group.getInviteLink.queryKey({ groupId }),
        });
      },
    })
  );

  async function share() {
    try {
      const result = await Share.share({
        title: 'Divvi Invite Link',
        message: `Join my group on Divvi!`,
        url: `https://divvi-app.uing.dev/invite/?token=${inviteData?.token}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }

  const handleDeactivateLink = () => {
    Alert.alert(
      'Deactivate Invite Link',
      'Are you sure you want to deactivate this invite link? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => deactivateInvite({ groupId }),
        },
      ]
    );
  };

  if (isInvitePending)
    return (
      <View className="h-[320px] px-4">
        <Loading expand />
      </View>
    );

  return (
    <View className="py\-4 p-4" style={{ paddingBottom: insets.bottom + 100 }}>
      <View className={cn('mx-auto w-full max-w-lg', 'web:rounded-2xl web:bg-card web:p-6')}>
        <View className="items-center justify-center">
          <TonalIcon Icon={UserPlus2} />
        </View>
        <View className="mb-6 gap-2">
          <Text variant="title1" className={cn('ios:font-bold pt-4 text-center')}>
            Invite Members
          </Text>
          <Text variant="body" className="px-8 text-center text-muted-foreground">
            {inviteData
              ? 'Share this link with others to invite them to your group'
              : 'Invite members to your group by sharing this link.'}
          </Text>
        </View>
      </View>

      {inviteData ? (
        <>
          <View className="mb-4 items-center justify-center">
            <View className="rounded-md bg-card p-3">
              <QRCode
                value={`https://divvi-app.uing.dev/invite/?token=${inviteData.token}`}
                color={colors.foreground}
                backgroundColor={colors.background}
                size={200}
              />
            </View>
          </View>
          <Text variant="footnote" className="pb-4 text-muted-foreground">
            This link will expire in 7 days. You can generate a new one at any time.
          </Text>

          <View className="mb-4 flex-row gap-4">
            <Button
              variant="muted"
              onPress={handleDeactivateLink}
              className="flex-1"
              disabled={isDeactivatingInvite}>
              {isDeactivatingInvite ? <Loading variant="button" /> : <Text>Deactivate Link</Text>}
            </Button>
            <Button variant="primary" onPress={share} className="flex-1">
              <Text>Share Link</Text>
            </Button>
          </View>
        </>
      ) : (
        <Button onPress={() => generateInvite({ groupId })} disabled={isGeneratingInvite} size="lg">
          {isGeneratingInvite ? (
            <Loading variant="button" color="white" />
          ) : (
            <Text>Generate Invite Link</Text>
          )}
        </Button>
      )}
    </View>
  );
};
