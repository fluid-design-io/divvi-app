import { Icon } from '@roninoss/icons';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { router, useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { View, LayoutAnimation } from 'react-native';

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
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
  // disabled?: boolean;
  originalData: ExpenseItem;
}

export default function GroupDetails() {
  const queryClient = useQueryClient();
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
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.filter((item: ExpenseItem) => item.id !== id),
              })),
            };
          }
        );
        // Prepare for layout animation
        listRef.current?.prepareForLayoutAnimationRender();
        // Configure the animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
      />
      <List
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        extraData={debouncedSearchTerm}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isPending ? <Loading /> : <ListEmpty searchTerm={debouncedSearchTerm} />
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
  const { colors } = useColorScheme();

  return (
    <Swipeable onDelete={() => info.item.onDelete?.(info.item.id)}>
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
