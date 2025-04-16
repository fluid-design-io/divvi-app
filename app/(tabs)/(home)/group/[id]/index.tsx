import { useInfiniteQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { View } from 'react-native';

// Assuming you have these components or similar ones
import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import {
  List,
  ListItem,
  ListRenderItemInfo, // Or define a specific type
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
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
  useColorScheme();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  // State for search input
  const [searchTerm, setSearchTerm] = useState('');
  // State for debounced search term (used in query)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Debounce time: 500ms

    return () => {
      clearTimeout(timerId); // Cleanup timeout on component unmount or searchTerm change
    };
  }, [searchTerm]);

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
      value: `$${item.amount.toFixed(2)} - ${new Date(item.date).toLocaleDateString()}`,
      originalData: item,
    };
  });

  // Render function uses the redefined interface
  function renderExpenseListItem(info: ListRenderItemInfo<ExpenseListDataItem>) {
    return (
      <ListItem
        {...info}
        variant="insets"
        // rightView can still be customized if needed,
        // but title/subtitle/value are likely handled by spreading info
        // If the 'value' prop above is used by ListItem, we might not need this rightView
        // Let's keep it for explicit amount/date display for now
        rightView={
          <View className="items-end px-2">
            <Text className="font-medium">${info.item.originalData.amount.toFixed(2)}</Text>
            <Text className="text-xs text-muted-foreground">
              {new Date(info.item.originalData.date).toLocaleDateString()}
            </Text>
          </View>
        }
        // If needed, add onPress based on info.item.id or info.item.originalData.id
        // onPress={() => console.log('Pressed:', info.item.id)}
      />
    );
  }

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
      {/* Stack.Screen can be used to set the header title dynamically */}
      <Stack.Screen
        options={{
          title: `Group Expenses`,
          headerSearchBarOptions: {
            hideWhenScrolling: true,
            placeholder: 'Search expenses...',
            onChangeText: (event) => {
              setSearchTerm(event.nativeEvent.text);
            },
            onCancelButtonPress: () => {
              setSearchTerm('');
            },
          },
        }}
      />
      <List
        data={listData} // Pass the mapped data
        renderItem={renderExpenseListItem} // Use the updated render function
        extraData={debouncedSearchTerm}
        ListEmptyComponent={
          isPending ? <Loading /> : <ListEmpty searchTerm={debouncedSearchTerm} />
        }
        ListFooterComponent={ListFooter} // Show loading indicator at the bottom
        refreshing={isRefetching && !isFetchingNextPage} // Only show top refresh indicator on manual refresh
        onRefresh={refetch} // Allow pull-to-refresh
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5} // Adjust as needed
        estimatedItemSize={60} // Add estimate for performance
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
