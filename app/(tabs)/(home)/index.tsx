import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import type { LargeTitleSearchBarRef } from '~/components/nativewindui/LargeTitleHeader/types';
import { List } from '~/components/nativewindui/List';
import { ListEmpty, ListSearchContent, renderItem } from '~/components/screen/group';
import { trpc } from '~/utils/api';
import { transformGroupsByDate, GroupListItem } from '~/utils/transform-groups-by-date';
import { useDebounce } from '@uidotdev/usehooks';
import { router } from 'expo-router';
import { authClient } from '~/lib/auth/client';
import { LayoutAnimation } from 'react-native';
import { FlashList } from '@shopify/flash-list';

// Main component name placeholder
export default function GroupList() {
  const queryClient = useQueryClient();
  const listRef = useRef<FlashList<GroupListItem>>(null);
  const searchBarRef = useRef<LargeTitleSearchBarRef | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const refetch = async () => await queryClient.invalidateQueries();

  const { data, isPending, isRefetching, error, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      trpc.group.all.infiniteQueryOptions(
        {},
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      )
    );

  const { mutate: deleteGroupMutation } = useMutation(
    trpc.group.delete.mutationOptions({
      onMutate: ({ groupId }) => {
        // Optimistically update the cache by removing the deleted group
        queryClient.setQueryData(trpc.group.all.infiniteQueryKey({}), (oldData) => {
          if (!oldData) return oldData;
          // For infinite queries, we need to update each page
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.filter((group) => group.id !== groupId),
            })),
          };
        });
        // Prepare for layout animation
        listRef.current?.prepareForLayoutAnimationRender();
        // Configure the animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      },
      onSuccess: () => {
        // Refetch the query to ensure the cache is in sync with the server
        queryClient.invalidateQueries({ queryKey: trpc.group.all.infiniteQueryKey() });
      },
    })
  );
  if (isSessionPending) return <Loading />;
  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  // Use the categorization function
  const DATA = transformGroupsByDate(data, {
    onPress: (groupId) => router.push(`/(tabs)/(home)/group/${groupId}`),
    onDelete: deleteGroupMutation,
    userId: session?.user.id!,
  });

  return (
    <>
      <LargeTitleHeader
        title="Divvi"
        searchBar={{
          ref: searchBarRef as RefObject<LargeTitleSearchBarRef>,
          onChangeText: setSearchTerm,
          content: <ListSearchContent searchTerm={debouncedSearchTerm} />,
        }}
      />

      <List
        ref={listRef}
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
