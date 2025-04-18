import { Icon } from '@roninoss/icons';
import { View } from 'react-native';
import { ListItem, ListRenderItemInfo } from '~/components/nativewindui/List';
import { useColorScheme } from '~/lib/useColorScheme';

type ContactListItemProps = ListRenderItemInfo<{
  title: string;
  subTitle?: string;
  onPress?: () => void;
  selected?: boolean;
}>;

export const renderContactListItem = (item: ContactListItemProps) => {
  return <ContactListItem {...item} />;
};

const ContactListItem = (props: ContactListItemProps) => {
  const { colors } = useColorScheme();
  // ignore if item doesn't have a subTitle - this means they don't have a phone number or email
  if (!props.item.subTitle) {
    return null;
  }
  return (
    <ListItem
      {...props}
      variant="insets"
      titleClassName="font-semibold"
      rightView={
        props.item.selected ? (
          <View className="w-10 flex-1 items-center justify-center">
            <Icon name="check" size={20} color={colors.primary} />
          </View>
        ) : null
      }
      onPress={props.item.onPress}
    />
  );
};
