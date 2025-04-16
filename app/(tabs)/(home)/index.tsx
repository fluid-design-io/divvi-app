import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import type { LargeTitleSearchBarRef } from '~/components/nativewindui/LargeTitleHeader/types';
import { List } from '~/components/nativewindui/List';
import { ListEmpty, ListSearchContent, renderItem } from '~/components/screen/group';
import AccountButton from '~/components/user/account-button';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate } from '~/utils/categorizeGroups';

// Main component name placeholder
export default function GroupList() {
  const searchBarRef = useRef<LargeTitleSearchBarRef | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isPending, isRefetching, error, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery(
      trpc.group.all.infiniteQueryOptions(
        {
          limit: 5,
          searchTerm: searchTerm || undefined,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.nextCursor;
          },
        }
      )
    );

  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  // Use the categorization function
  const DATA = categorizeGroupsByDate(data);

  return (
    <>
      <LargeTitleHeader
        title="Divvi"
        rightView={() => <AccountButton />}
        searchBar={{
          ref: searchBarRef as RefObject<LargeTitleSearchBarRef>,
          onChangeText: setSearchTerm,
          content: <ListSearchContent searchTerm={searchTerm} />,
        }}
      />

      <List
        variant="insets"
        data={DATA}
        renderItem={renderItem}
        sectionHeaderAsGap={false}
        ListEmptyComponent={isPending ? <Loading /> : <ListEmpty />}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentInsetAdjustmentBehavior="automatic"
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
      />
    </>
  );
}
