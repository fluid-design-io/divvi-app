import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { categorizeGroupsByDate } from '~/utils/categorize-groups';
import { useDebounce } from '@uidotdev/usehooks';

// Main component name placeholder
export default function GroupList() {
  const queryClient = useQueryClient();
  const searchBarRef = useRef<LargeTitleSearchBarRef | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isPending, isRefetching, error, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery(
      trpc.group.all.infiniteQueryOptions(
        {
          limit: 5,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      )
    );

  const { mutate: deleteGroupMutation } = useMutation(
    trpc.group.delete.mutationOptions({
      onMutate: ({ groupId }) => {
        // Optimistically update the cache by removing the deleted group
        queryClient.setQueryData(
          trpc.group.all.infiniteQueryKey({
            limit: 5,
          }),
          (oldData) => {
            if (!oldData) return oldData;
            // For infinite queries, we need to update each page
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.filter((group: any) => group.id !== groupId),
              })),
            };
          }
        );
      },
      onSuccess: () => {
        // Refetch the query to ensure the cache is in sync with the server
        queryClient.invalidateQueries({ queryKey: trpc.group.all.queryKey() });
      },
    })
  );

  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  // Use the categorization function
  const DATA = categorizeGroupsByDate(data, deleteGroupMutation);

  return (
    <>
      <LargeTitleHeader
        title="Divvi"
        rightView={() => <AccountButton />}
        searchBar={{
          ref: searchBarRef as RefObject<LargeTitleSearchBarRef>,
          onChangeText: setSearchTerm,
          content: <ListSearchContent searchTerm={debouncedSearchTerm} />,
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
