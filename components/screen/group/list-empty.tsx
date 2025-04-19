import { EmptyView } from '~/components/core/empty-view';

// Displayed when the list is empty (e.g., no data).
export default function ListEmpty() {
  return (
    <EmptyView
      title="No Groups"
      description="Click on the '+' button to create a new group"
      icon={{ name: 'info.circle', ios: { name: 'rectangle.stack' } }}
      bottomTab
    />
  );
}
