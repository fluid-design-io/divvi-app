import { Icon } from '@roninoss/icons';
import { View } from 'react-native';
import { TouchableBounce } from '~/components/core/touchable-bounce';
import { Card, CardContent, CardDescription } from '~/components/nativewindui/Card';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { Skeleton } from '~/components/core/skeleton';
import { router } from 'expo-router';
import { RouterOutputs } from '~/server/api';

type Group = Pick<NonNullable<RouterOutputs['group']['getById']>, 'id' | 'name' | 'description'>;

export const SelectGroup = ({ group }: { group?: Group }) => {
  const { colors } = useColorScheme();

  return (
    <TouchableBounce
      onPress={() =>
        router.push(`./select-group?groupId=${group?.id}`, {
          relativeToDirectory: true,
        })
      }>
      <Card>
        <CardContent>
          <View className="flex-row items-center justify-between">
            <View>
              <CardDescription className="text-xs">Group</CardDescription>
              <Text className="font-medium" numberOfLines={1} ellipsizeMode="tail">
                {group?.name ?? 'No group selected'}
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
              {group?.name ?? 'No group selected'}
            </CardDescription>
            <Text className="font-medium" numberOfLines={1} ellipsizeMode="tail">
              {group?.description ? 'No description' : 'Create new group'}
            </Text>
          </View>
          {showIcon && <Icon name="chevron-right" size={22} color={colors.grey2} />}
        </View>
      </CardContent>
    </Card>
  );
};
