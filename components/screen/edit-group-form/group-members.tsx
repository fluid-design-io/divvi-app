import { useActionSheet } from '@expo/react-native-action-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { PlusIcon } from 'lucide-react-native';
import { Alert, ScrollView, View } from 'react-native';

import { Skeleton } from '~/components/core/skeleton';
import { TouchableBounce } from '~/components/core/touchable-bounce';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { Text } from '~/components/nativewindui/Text';
import { RouterOutputs } from '~/utils/api';
import { initials } from '~/utils/format';
import { useLocalSearchParams } from 'expo-router';
import { authClient } from '~/lib/auth/client';
import { useSheetRef } from '~/components/nativewindui/Sheet';
import { Contact } from './contacts-picker';
import { usePreventRemove } from '@react-navigation/native';
import { useState } from 'react';
import { InviteMemberSheet } from './invite-member-sheet';

type GroupMember = NonNullable<RouterOutputs['group']['getById']>['members'][number];

export const GroupMembers = ({
  members,
  editable = false,
}: {
  members?: GroupMember[];
  editable?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { showActionSheetWithOptions } = useActionSheet();
  const bottomSheetModalRef = useSheetRef();
  const [preventRemove, setPreventRemove] = useState(false);
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { mutate: removeMember } = useMutation(
    trpc.group.removeMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.group.getById.queryKey({ groupId }) });
      },
    })
  );
  const onDeleteMember = (member: GroupMember) => {
    // ignore if auth is pending
    if (isAuthPending) return;
    // ignore if the member is the same as the user
    if (session?.user.id === member.user.id) return;

    const options = [`Remove ${member.user.name}`, 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        if (selectedIndex === undefined) {
          return;
        }
        switch (selectedIndex) {
          case destructiveButtonIndex:
            Alert.alert(
              'Remove Member',
              `Are you sure you want to remove ${member.user.name}? ${member.user.name} will no longer be able to access this group.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => removeMember({ groupId, userId: member.user.id }),
                },
              ]
            );
            break;
          case cancelButtonIndex:
            break;
        }
      }
    );
  };
  const openSheet = () => {
    bottomSheetModalRef.current?.present();
    setPreventRemove(true);
  };

  usePreventRemove(preventRemove, () => {});

  return (
    <>
      <View className="mt-4 gap-2">
        <Text variant="caption1">Members</Text>
        <View className="w-full rounded-lg bg-card">
          <ScrollView
            horizontal
            contentContainerClassName="gap-4 p-4"
            showsHorizontalScrollIndicator={false}>
            {members?.map((member) => (
              <GroupMemberAvatar
                key={`member-${member.id}`}
                member={member}
                onPress={() => onDeleteMember(member)}
              />
            ))}
            {editable && (
              <TouchableBounce onPress={openSheet}>
                <View className="items-center gap-2">
                  <View className="ios:bg-background bg-muted/30 h-16 w-16 items-center justify-center rounded-full">
                    <PlusIcon className="h-8 w-8 text-muted-foreground" />
                  </View>
                  <Text className="text-muted-foreground" variant="caption1">
                    Invite
                  </Text>
                </View>
              </TouchableBounce>
            )}
          </ScrollView>
        </View>
      </View>

      <InviteMemberSheet onDismiss={() => setPreventRemove(false)} ref={bottomSheetModalRef} />
    </>
  );
};

const GroupMemberAvatar = ({ member, onPress }: { member: GroupMember; onPress?: () => void }) => {
  return (
    <TouchableBounce onPress={onPress}>
      <View className="items-center gap-2">
        <Avatar alt="User Avatar" className="bg-muted/30 h-16 w-16">
          {member.user.image && <AvatarImage source={{ uri: member.user.image }} />}
          <AvatarFallback>
            <Text>{initials(member.user.name ?? 'Anonymous')}</Text>
          </AvatarFallback>
        </Avatar>
        <Text
          variant="caption1"
          className="max-w-20 text-muted-foreground"
          numberOfLines={1}
          ellipsizeMode="middle">
          {member.user.name ?? 'Anonymous'}
        </Text>
      </View>
    </TouchableBounce>
  );
};

const UserSkeleton = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <View
      key={`quick-send-skeleton-${index}`}
      className="w-16 items-center justify-center gap-2 rounded-full">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-[15.25px] w-12" />
    </View>
  ));
};

export function GroupMemberSkeleton() {
  return (
    <ScrollView horizontal contentContainerClassName="gap-4" className="mt-2">
      <UserSkeleton />
    </ScrollView>
  );
}
