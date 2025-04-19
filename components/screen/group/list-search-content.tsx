import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';

import Loading from '~/components/core/loading';
import { List } from '~/components/nativewindui/List';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate } from '~/utils/categorize-groups';
import ListEmpty from './list-empty';
import { renderItem } from './render-item';
import { router } from 'expo-router';
import { authClient } from '~/lib/auth/client';

export default function GroupListSearchContent({ searchTerm }: { searchTerm: string }) {
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { data, isPending, isRefetching, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    trpc.group.all.infiniteQueryOptions(
      {
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

  const { mutate: deleteGroupMutation } = useMutation(
    trpc.group.delete.mutationOptions({
      onMutate: ({ groupId }) => {
        // Optimistically update the cache by removing the deleted group
        queryClient.setQueryData(trpc.group.all.infiniteQueryKey(), (oldData) => {
          if (!oldData) return oldData;
          // For infinite queries, we need to update each page
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.filter((group: any) => group.id !== groupId),
            })),
          };
        });
      },
      onSuccess: () => {
        // Refetch the query to ensure the cache is in sync with the server
        queryClient.invalidateQueries({ queryKey: trpc.group.all.infiniteQueryKey() });
      },
    })
  );

  if (isSessionPending) return <Loading />;
  // Use the categorization function
  const DATA = categorizeGroupsByDate(data, {
    onPress: (groupId) => router.push(`/group/${groupId}`),
    onDelete: deleteGroupMutation,
    userId: session?.user.id!,
  });

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
