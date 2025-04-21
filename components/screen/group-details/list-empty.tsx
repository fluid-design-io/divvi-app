import { EmptyView } from '~/components/core/empty-view';

export function ListEmpty({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyView
      title="No Expenses"
      description={
        searchTerm
          ? `No expenses found for "${searchTerm}"`
          : 'Click on the "+" button to add an expense'
      }
      icon={{ name: searchTerm ? 'magnify' : 'information' }}
      minHeaderHeight={150}
    />
  );
}
