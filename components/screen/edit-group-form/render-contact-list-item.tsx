import { ListItem, ListRenderItemInfo } from '~/components/nativewindui/List';

type ContactListItemProps = ListRenderItemInfo<any>;

export const renderContactListItem = (item: ContactListItemProps) => {
  return <ContactListItem {...item} />;
};

const ContactListItem = ({ item }: ContactListItemProps) => {
  return <ListItem {...item} />;
};
