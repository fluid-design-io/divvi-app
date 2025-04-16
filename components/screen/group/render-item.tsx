import { View } from 'react-native';

import { ListRenderItemInfo, ListSectionHeader } from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { GroupListItem } from '~/utils/categorizeGroups';
import ListItem from './list-item';
import Swipeable from './swipeable';

// Wrapper to pass the item info to the actual Item component
export function renderItem(info: ListRenderItemInfo<GroupListItem>) {
  return <Item info={info} />;
}

// The actual ListItem (row) component.
function Item({ info }: { info: ListRenderItemInfo<GroupListItem> }) {
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

  return (
    <Swipeable onDelete={info.item.onDelete}>
      <ListItem
        {...info}
        target="Cell"
        variant="insets"
        rightView={
          <View className="flex-1 items-end justify-between gap-0.5 px-2">
            <Text className="text-muted-foreground">
              {info.item.memberCount + ` member${info.item.memberCount === 1 ? '' : 's'}`}
            </Text>
            <Text className="font-rounded text-muted-foreground">
              {info.item.totalBalance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2,
                minimumFractionDigits: 0,
              })}
            </Text>
          </View>
        }
        disabled={info.item.disabled}
        onPress={info.item.onPress}
      />
    </Swipeable>
  );
}
