import { useInfiniteQuery } from '@tanstack/react-query';
import { View } from 'react-native';

import Loading from '~/components/core/loading';
import { List } from '~/components/nativewindui/List';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate } from '~/utils/categorizeGroups';
import ListEmpty from './list-empty';
import { renderItem } from './render-item';

export default function GroupListSearchContent({ searchTerm }: { searchTerm: string }) {
  const { data, isPending, isRefetching, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    trpc.group.all.infiniteQueryOptions(
      {
        limit: 5,
        searchTerm: searchTerm || undefined,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
        enabled: !!searchTerm,
      }
    )
  );

  // Use the categorization function
  const DATA = categorizeGroupsByDate(data);

  return (
    <View className="flex-1 bg-background">
      <List
        variant="insets"
        data={DATA}
        renderItem={renderItem}
        sectionHeaderAsGap={false}
        ListEmptyComponent={isPending ? <Loading /> : <ListEmpty />}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
      />
    </View>
  );
}
