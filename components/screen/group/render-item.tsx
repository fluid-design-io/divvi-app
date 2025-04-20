import { View } from 'react-native';

import { ListRenderItemInfo, ListSectionHeader } from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { GroupListItem } from '~/utils/categorize-groups';
import ListItem from './list-item';
import Swipeable from './swipeable';
import { Icon } from '@roninoss/icons';
import { useColorScheme } from '~/lib/useColorScheme';
import { formatCurrency } from '~/utils/format';

// Wrapper to pass the item info to the actual Item component
export function renderItem(info: ListRenderItemInfo<GroupListItem>) {
  return <Item info={info} />;
}

// The actual ListItem (row) component.
function Item({ info }: { info: ListRenderItemInfo<GroupListItem> }) {
  const { colors } = useColorScheme();
  // If it's a string, treat it as a section header
  if (typeof info.item === 'string') {
    return (
      <ListSectionHeader
        {...info}
        className="ios:pb-2 pl-0"
        textVariant="title3"
        textClassName="text-foreground font-semibold"
      />
    );
  }
  const listItem = (
    <ListItem
      {...info}
      target="Cell"
      variant="insets"
      titleClassName="font-semibold"
      textContentClassName="justify-between"
      rightView={
        <View className="flex-1 items-end justify-between gap-0.5 px-2">
          <View className="flex-row items-center gap-0.5">
            <Text className="font-rounded text-muted-foreground" variant="caption1">
              {info.item.memberCount}
            </Text>
            <Icon name="person" size={14} color={colors.grey3} />
          </View>
          <Text className="font-rounded text-muted-foreground" variant="caption1">
            {formatCurrency(info.item.totalBalance / 100)}
          </Text>
        </View>
      }
      disabled={info.item.disabled}
      onPress={info.item.onPress}
    />
  );
  if (info.item.onDelete) {
    return <Swipeable onDelete={info.item.onDelete}>{listItem}</Swipeable>;
  }
  return listItem;
}
