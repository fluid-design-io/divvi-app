import { Icon } from '@roninoss/icons';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

// Assuming you have these components or similar ones
import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import { AdaptiveSearchHeader } from '~/components/nativewindui/AdaptiveSearchHeader';
import {
  List,
  ListItem,
  ListRenderItemInfo, // Or define a specific type
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import Swipeable from '~/components/screen/group/swipeable';
import { useColorScheme } from '~/lib/useColorScheme';
import { trpc } from '~/utils/api';
import type { RouterOutputs } from '~/utils/api';

// Define the type for a single expense item based on the router output
type ExpenseItem = RouterOutputs['expense']['getByGroupId']['items'][number];

// Redefine the interface without extending ListDataItem
interface ExpenseListDataItem {
  id: string;
  title: string;
  subTitle?: string;
  value?: string;
  // Add any other standard fields ListItem might implicitly use (e.g., onPress, disabled - though we handle onPress separately)
  // onPress?: () => void;
  // disabled?: boolean;
  originalData: ExpenseItem;
}

export default function GroupDetails() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

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
      subTitle: item.description ?? `Paid by ${paidByName}`,
      originalData: item,
    };
  });

  // Optional: Footer component to show loading indicator during fetchNextPage
  function ListFooter() {
    if (isFetchingNextPage) {
      return <Loading className="py-4" />;
    }
    if (!hasNextPage && flattenedExpenses.length > 0) {
      // Use flattenedExpenses here
      // Optional: Indicate end of list
      return (
        <View className="items-center py-4">
          <Text className="text-muted-foreground">No more expenses</Text>
        </View>
      );
    }
    return null;
  }

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
      />
      <List
        data={listData} // Pass the mapped data
        renderItem={renderItem} // Use the updated render function
        extraData={debouncedSearchTerm}
        ListEmptyComponent={
          isPending ? <Loading /> : <ListEmpty searchTerm={debouncedSearchTerm} />
        }
        ListFooterComponent={ListFooter} // Show loading indicator at the bottom
        refreshing={isRefetching}
        onRefresh={refetch} // Allow pull-to-refresh
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5} // Adjust as needed
        contentInsetAdjustmentBehavior="automatic"
        variant="insets"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
}

// Displayed when the list is empty
function ListEmpty({ searchTerm }: { searchTerm?: string }) {
  const message = searchTerm
    ? `No expenses found for "${searchTerm}"`
    : 'No expenses found in this group';
  return (
    <View className="flex-1 items-center justify-center p-10">
      <Info className="mb-2 h-6 w-6 text-muted-foreground" />
      <Text className="text-center text-sm text-muted-foreground">{message}</Text>
    </View>
  );
}

function renderItem(info: ListRenderItemInfo<ExpenseListDataItem>) {
  return <ListRenderItem {...info} />;
}

function ListRenderItem(info: ListRenderItemInfo<ExpenseListDataItem>) {
  const queryClient = useQueryClient();
  const { colors } = useColorScheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { mutate: deleteExpense } = useMutation(
    trpc.expense.delete.mutationOptions({
      onMutate: ({ id }) => {
        queryClient.setQueryData(
          trpc.expense.getByGroupId.infiniteQueryKey({
            groupId,
          }),
          (oldData) => {
            if (!oldData) return oldData;
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
      },
    })
  );
  return (
    <Swipeable onDelete={() => deleteExpense({ id: info.item.id })}>
      <ListItem
        {...info}
        variant="insets"
        rightView={
          <View className="flex-1 flex-row items-center gap-0.5 px-2">
            <View className="items-end justify-between">
              <Text className="font-medium">${info.item.originalData.amount.toFixed(2)}</Text>
              <Text className="text-xs text-muted-foreground">
                {new Date(info.item.originalData.date).toLocaleDateString()}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.grey2} />
          </View>
        }
        // If needed, add onPress based on info.item.id or info.item.originalData.id
        // onPress={() => console.log('Pressed:', info.item.id)}
      />
    </Swipeable>
  );
}
