import { router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { Skeleton } from '~/components/core/skeleton';
import { TouchableBounce } from '~/components/core/touchable-bounce';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { Text } from '~/components/nativewindui/Text';
import { RouterOutputs } from '~/utils/api';

export const Members = () => {
  const isLoading = false;
  const user = null;
  const favorites = [];
  const openSheet = () => {};
  return (
    <ScrollView
      horizontal
      contentContainerClassName="gap-4"
      className="mt-2"
      showsHorizontalScrollIndicator={false}
      style={{
        marginHorizontal: -16,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}>
      {isLoading || !user?.id ? (
        <UserSkeleton />
      ) : (
        favorites?.map((fav) => <QuickSendAvatar key={fav.id} friend={fav} userId={user.id} />)
      )}
      <TouchableBounce onPress={openSheet}>
        <View className="items-center gap-2">
          <View className="ios:bg-background bg-muted/30 h-16 w-16 items-center justify-center rounded-full">
            <PlusIcon className="h-8 w-8 text-muted-foreground" />
          </View>
          <Text className="text-muted-foreground" variant="caption1">
            Add a friend
          </Text>
        </View>
      </TouchableBounce>
    </ScrollView>
  );
};

const QuickSendAvatar = ({
  friend,
  userId,
}: {
  friend: RouterOutputs['user']['getFavoriteRecipients'][number];
  userId: string;
}) => {
  return (
    <TouchableBounce
      onPress={() => {
        router.push({
          pathname: '/transfer',
          params: {
            sender: JSON.stringify({
              id: userId,
              type: 'USER',
            }),
            recipient: JSON.stringify({
              id: friend.id,
              type: 'USER',
            }),
          },
        });
      }}>
      <View className="items-center gap-2">
        <Avatar alt="User Avatar" className="bg-muted/30 h-16 w-16">
          <AvatarImage source={{ uri: friend.picture }} />
          <AvatarFallback>
            <Text>
              {friend?.displayName?.split(' ')?.[0]?.charAt(0)}
              {friend?.displayName?.split(' ')?.[1]?.charAt(0)}
            </Text>
          </AvatarFallback>
        </Avatar>
        <Text
          variant="caption1"
          className="max-w-20 text-muted-foreground"
          numberOfLines={1}
          ellipsizeMode="middle">
          {friend?.displayName ?? 'Unknown'}
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

export function QuickSendSkeleton() {
  return (
    <ScrollView horizontal contentContainerClassName="gap-4" className="mt-2">
      <UserSkeleton />
    </ScrollView>
  );
}
