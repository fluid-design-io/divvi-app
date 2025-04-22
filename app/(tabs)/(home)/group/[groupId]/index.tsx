import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { LayoutAnimation } from 'react-native';

// Assuming you have these components or similar ones
import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import {
  List, // Or define a specific type
} from '~/components/nativewindui/List';
import { trpc } from '~/utils/api';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import { Toolbar, ToolbarCTA, ToolbarIcon } from '~/components/nativewindui/Toolbar';
import {
  ExpenseItem,
  ListDataItem,
  TabType,
  ListHeader,
  renderItem,
  ListEmpty,
} from '~/components/screen/group-details';
import { transformGroupExpenseData } from '~/utils/transform-group-expense-data';
import { authClient } from '~/lib/auth/client';

// Define the type for a single expense item based on the router output

export default function GroupDetails() {
  const queryClient = useQueryClient();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const listRef = useRef<FlashList<ListDataItem<'expenses'> | ListDataItem<'members'>>>(null);
  const { isPending: isSessionPending } = authClient.useSession();

  // State for search input
  const [searchTerm, setSearchTerm] = useState('');
  // State for debounced search term (used in query)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // State for selected tab
  const [selectedTab, setSelectedTab] = useState<TabType>('expenses');

  const { data: group } = useQuery(trpc.group.getById.queryOptions({ groupId }));
  // Fetch expenses - place keepPreviousData inside the second argument

  const {
    data,
    isPending,
    isFetchingNextPage,
    isRefetching,
    isPlaceholderData,
    error,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch: refetchExpense,
  } = useInfiniteQuery(
    trpc.expense.getByGroupId.infiniteQueryOptions(
      // Input object
      { groupId, searchTerm: debouncedSearchTerm || undefined },
      {
        enabled: selectedTab === 'expenses' || selectedTab === 'members',
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  const { mutate: deleteExpense } = useMutation(
    trpc.expense.delete.mutationOptions({
      onMutate: ({ id }) => {
        // Optimistically update the list
        queryClient.setQueryData(
          trpc.expense.getByGroupId.infiniteQueryKey({
            groupId,
          }),
          (oldData) => {
            if (!oldData) return oldData;
            // Prepare for layout animation
            listRef.current?.prepareForLayoutAnimationRender();
            // Configure the animation
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.filter((item: ExpenseItem) => item.id !== id),
              })),
            };
          }
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.expense.getByGroupId.infiniteQueryKey({
            groupId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.group.all.infiniteQueryKey(),
        });
      },
    })
  );

  if (isSessionPending) return <Loading />;
  // Handle error state
  if (isError) {
    return <ErrorView message={error?.message} onRetry={refetchExpense} />;
  }

  const listData = transformGroupExpenseData({
    onPress: (expenseId) => router.push(`/expense/${expenseId}`),
    onDelete: (expenseId) => deleteExpense({ id: expenseId }),
    onSettleUp: (props) => router.push({ pathname: '/settle', params: { ...props, groupId } }),
    selectedTab,
    expenses: data,
    members: group?.members,
  });
  return (
    <>
      <LargeTitleHeader
        title={group?.name ?? 'Loading...'}
        searchBar={{
          // ! Causing UI glitch on mount
          iosHideWhenScrolling: true,
          onChangeText: setSearchTerm,
          onCancelButtonPress: () => {
            setSearchTerm('');
          },
        }}
      />
      <List
        ref={listRef as any}
        data={listData}
        renderItem={renderItem}
        extraData={debouncedSearchTerm}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<ListHeader selectedTab={selectedTab} onSelectTab={setSelectedTab} />}
        ListEmptyComponent={
          isPending ? <Loading /> : <ListEmpty searchTerm={debouncedSearchTerm} />
        }
        refreshing={isRefetching && !isPlaceholderData}
        onRefresh={refetchExpense}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        contentInsetAdjustmentBehavior="automatic"
        variant="insets"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      />
      <Toolbar
        className="absolute bottom-0 left-0 right-0"
        leftView={
          <ToolbarIcon
            icon={{ name: 'cog-outline' }}
            onPress={() => router.push(`/(modal)/group/${groupId}/edit`)}
            accessibilityLabel="Edit Group"
          />
        }
        rightView={
          <ToolbarCTA
            icon={{ name: 'pencil-box-outline' }}
            onPress={() => router.push(`/expense/new?groupId=${groupId}`)}
            accessibilityLabel="Add Expense"
          />
        }
      />
    </>
  );
}

// Displayed when the list is empty

// Define the tab configurations

// Update the GroupStatSwitcher to use the dynamic component
