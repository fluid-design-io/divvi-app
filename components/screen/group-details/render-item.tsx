import { Icon } from '@roninoss/icons';
import { View } from 'react-native';

import { ListItem, ListRenderItemInfo } from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import Swipeable from '~/components/screen/group/swipeable';
import { formatCurrency } from '~/utils/format';
import { useColorScheme } from '~/lib/useColorScheme';
import { ListDataItem, TabType } from './types';
import { MemberListItem } from './member-list-item';
import { GroupExpenseView } from './group-expense-view';

export function renderItem<T extends TabType>(info: ListRenderItemInfo<ListDataItem<T>>) {
  return <ListRenderItem {...info} />;
}

function ListRenderItem<T extends TabType>(info: ListRenderItemInfo<ListDataItem<T>>) {
  const { colors } = useColorScheme();
  const item = info.item;

  if (item.type === 'expense') {
    return (
      <Swipeable onDelete={() => item.onDelete?.(item.id)}>
        <ListItem
          {...info}
          variant="insets"
          rightView={
            <View className="flex-1 flex-row items-center gap-0.5 px-2">
              <View className="items-end justify-between">
                <Text className="font-medium">
                  {formatCurrency(item.originalData.amount / 100)}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {new Date(item.originalData.date).toLocaleDateString()}
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={colors.grey2} />
            </View>
          }
          onPress={() => item.onPress(item.id)}
        />
      </Swipeable>
    );
  }

  if (item.type === 'member') {
    return <MemberListItem {...(info as ListRenderItemInfo<ListDataItem<'members'>>)} />;
  }

  if (item.type === 'stats') {
    return <GroupExpenseView />;
  }

  return null;
}
