import { Icon } from '@roninoss/icons';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { View, LayoutAnimation } from 'react-native';

// Assuming you have these components or similar ones
import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import { AdaptiveSearchHeader } from '~/components/nativewindui/AdaptiveSearchHeader';
import {
  ExtendedListDataItem,
  List,
  ListItem,
  ListRenderItemInfo, // Or define a specific type
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import Swipeable from '~/components/screen/group/swipeable';
import { formatCurrency } from '~/utils/format';
import { useColorScheme } from '~/lib/useColorScheme';
import { trpc } from '~/utils/api';
import type { RouterOutputs } from '~/utils/api';
import { Button } from '~/components/nativewindui/Button';
import { EmptyView } from '~/components/core/empty-view';

// Define the type for a single expense item based on the router output
type ExpenseItem = RouterOutputs['expense']['getByGroupId']['items'][number];

// Redefine the interface without extending ListDataItem
type ExpenseListDataItem = Exclude<ExtendedListDataItem, string> & {
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
  originalData: ExpenseItem;
};

export default function GroupDetails() {
  const queryClient = useQueryClient();
  const { colors } = useColorScheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const listRef = useRef<FlashList<ExpenseListDataItem>>(null);

  // State for search input
  const [searchTerm, setSearchTerm] = useState('');
  // State for debounced search term (used in query)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: group } = useQuery(trpc.group.getById.queryOptions({ groupId }));
  // Fetch expenses - place keepPreviousData inside the second argument

  const {
    data,
    isPending,
    isFetchingNextPage,
    isRefetching,
    error,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    trpc.expense.getByGroupId.infiniteQueryOptions(
      // Input object
      { groupId: groupId!, searchTerm: debouncedSearchTerm || undefined },
      {
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

  // Handle error state
  if (isError) {
    return <ErrorView message={error?.message} onRetry={refetch} />;
  }

  // Flatten and map the data
  const flattenedExpenses = data?.pages.flatMap((page) => page.items) ?? [];
  const listData: ExpenseListDataItem[] = flattenedExpenses.map((item) => {
    const paidByName = (item.paidBy as any)?.name || 'Unknown';
    return {
      id: item.id,
      title: item.title,
      subTitle: `Paid by ${paidByName}`,
      tertiaryText: item.description ?? undefined,
      originalData: item,
      onDelete: () => deleteExpense({ id: item.id }),
      onPress: () => router.push(`/expense/${item.id}`),
    };
  });
  return (
    <>
      <AdaptiveSearchHeader
        iosTitle={group?.name ?? 'Loading...'}
        searchBar={{
          // ! Causing UI glitch on mount
          // iosHideWhenScrolling: true,
          onChangeText: setSearchTerm,
          onCancelButtonPress: () => {
            setSearchTerm('');
          },
        }}
        rightView={() => (
          <Button
            variant="plain"
            size="none"
            onPress={() => router.push(`/(modal)/group/${groupId}/edit`)}>
            <Icon name="cog" size={22} color={colors.primary} />
          </Button>
        )}
      />
      <List
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        extraData={debouncedSearchTerm}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isPending ? (
            <Loading />
          ) : (
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
          )
        }
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            hasItems={flattenedExpenses.length > 0}
          />
        }
        refreshing={isRefetching}
        onRefresh={refetch}
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
      />
    </>
  );
}

// Displayed when the list is empty

function renderItem(info: ListRenderItemInfo<ExpenseListDataItem>) {
  return <ListRenderItem {...info} />;
}

function ListRenderItem(info: ListRenderItemInfo<ExpenseListDataItem>) {
  const { colors } = useColorScheme();

  return (
    <Swipeable onDelete={() => info.item.onDelete?.(info.item.id)}>
      <ListItem
        {...info}
        variant="insets"
        rightView={
          <View className="flex-1 flex-row items-center gap-0.5 px-2">
            <View className="items-end justify-between">
              <Text className="font-medium">
                {formatCurrency(info.item.originalData.amount / 100)}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {new Date(info.item.originalData.date).toLocaleDateString()}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.grey2} />
          </View>
        }
        onPress={() => info.item.onPress(info.item.id)}
      />
    </Swipeable>
  );
}

// Optional: Footer component to show loading indicator during fetchNextPage
function ListFooter({
  isFetchingNextPage,
  hasNextPage,
  hasItems,
}: {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasItems: boolean;
}) {
  if (isFetchingNextPage) {
    return <Loading className="py-4" />;
  }
  if (!hasNextPage && hasItems) {
    return (
      <View className="items-center py-4">
        <Text className="text-muted-foreground">No more expenses</Text>
      </View>
    );
  }
  return null;
}
