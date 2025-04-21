import { View } from 'react-native';
import Loading from '~/components/core/loading';
import { Text } from '~/components/nativewindui/Text';

export function ListFooter({
  isFetchingNextPage,
  hasNextPage,
  hasItems,
}: {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasItems: boolean;
}) {
  if (isFetchingNextPage) {
    return <Loading className="py-4" />;
  }
  if (!hasNextPage && hasItems) {
    return (
      <View className="items-center py-4">
        <Text className="text-muted-foreground">No more expenses</Text>
      </View>
    );
  }
  return null;
}
