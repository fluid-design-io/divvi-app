import { Icon } from '@roninoss/icons';
import { View } from 'react-native';
import { TouchableBounce } from '~/components/core/touchable-bounce';
import { Card, CardContent, CardDescription } from '~/components/nativewindui/Card';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { trpc } from '~/utils/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '~/components/core/skeleton';
import { router, useLocalSearchParams } from 'expo-router';

export const SelectGroup = () => {
  const { colors } = useColorScheme();
  const { groupId } = useLocalSearchParams<{ id: string; groupId?: string }>();
  const { data: defaultGroup, isPending: isDefaultGroupPending } = useQuery(
    trpc.group.getDefault.queryOptions(undefined, { enabled: !groupId })
  );
  const { data: groupData, isPending: isGroupPending } = useQuery(
    trpc.group.getById.queryOptions({ groupId: groupId ?? '' }, { enabled: !!groupId })
  );
  if ((groupId && isGroupPending) || (!groupId && isDefaultGroupPending))
    return (
      <Card>
        <CardContent>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Skeleton className="h-10 w-16 rounded-lg" />
              <View>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-4 w-40" />
              </View>
            </View>
            <Skeleton className="h-8 w-20" />
          </View>
        </CardContent>
      </Card>
    );
  const selectedGroupData = groupId ? groupData : defaultGroup;

  return (
    <TouchableBounce
      onPress={() =>
        // router.push({
        //   pathname: '/expense/[expenseId]/select-group',
        //   params: { expenseId: id, groupId: selectedGroupData?.id },
        // })
        router.push(`./select-group?groupId=${selectedGroupData?.id}`, {
          relativeToDirectory: true,
        })
      }>
      <Card>
        <CardContent>
          <View className="flex-row items-center justify-between">
            <View>
              <CardDescription className="text-xs">{selectedGroupData?.name}</CardDescription>
              <Text className="font-medium">
                {selectedGroupData?.description ?? 'No description'}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.grey2} />
          </View>
        </CardContent>
      </Card>
    </TouchableBounce>
  );
};
