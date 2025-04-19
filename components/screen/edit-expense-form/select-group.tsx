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

type Group = {
  id: string;
  name: string;
  description: string;
};

export const SelectGroup = () => {
  const { colors } = useColorScheme();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();

  const { data: groupData, isPending: isGroupPending } = useQuery(
    trpc.group.getById.queryOptions(
      { groupId: groupId ?? '' },
      { enabled: groupId?.toString() !== 'undefined' }
    )
  );

  if (!groupId && isGroupPending) return <SelectGroupCardPending />;
  const selectedGroupData = groupId ? groupData : null;

  return (
    <TouchableBounce
      onPress={() =>
        router.push(`./select-group?groupId=${selectedGroupData?.id}`, {
          relativeToDirectory: true,
        })
      }>
      <Card>
        <CardContent>
          <View className="flex-row items-center justify-between">
            <View>
              <CardDescription className="text-xs">Group</CardDescription>
              <Text className="font-medium" numberOfLines={1} ellipsizeMode="tail">
                {selectedGroupData?.name ?? 'No group selected'}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.grey2} />
          </View>
        </CardContent>
      </Card>
    </TouchableBounce>
  );
};

export const SelectGroupCardPending = () => {
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
};

export const SelectGroupCard = ({
  group,
  showIcon = true,
}: {
  group: Group;
  showIcon?: boolean;
}) => {
  const { colors } = useColorScheme();
  return (
    <Card>
      <CardContent>
        <View className="flex-row items-center justify-between">
          <View>
            <CardDescription className="text-xs">
              {group.name ?? 'No group selected'}
            </CardDescription>
            <Text className="font-medium" numberOfLines={1} ellipsizeMode="tail">
              {group.description ? 'No description' : 'Create new group'}
            </Text>
          </View>
          {showIcon && <Icon name="chevron-right" size={22} color={colors.grey2} />}
        </View>
      </CardContent>
    </Card>
  );
};
