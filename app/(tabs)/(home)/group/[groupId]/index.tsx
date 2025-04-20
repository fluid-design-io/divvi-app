import { Icon } from '@roninoss/icons';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { View, LayoutAnimation, Pressable, StyleSheet } from 'react-native';

// Assuming you have these components or similar ones
import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
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
import { EmptyView } from '~/components/core/empty-view';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import { Toolbar, ToolbarCTA, ToolbarIcon } from '~/components/nativewindui/Toolbar';
import Animated from 'react-native-reanimated';

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
  useColorScheme();
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
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        extraData={debouncedSearchTerm}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<GroupStatSwitcher />}
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function GroupStatSwitcher() {
  const { colors } = useColorScheme();
  const expenseActiveColor = colors.primary;
  // const membersActiveColor = '#1758a3';
  // const statsActiveColor = '#1758a3';
  const inactiveColor = colors.grey5;
  const activeIconColor = colors.background;
  const inactiveIconColor = colors.grey;
  const activeTextColor = colors.background;
  const inactiveTextColor = colors.grey;
  return (
    <View className="-mt-2 mb-6 flex-row items-center gap-2">
      <AnimatedPressable
        style={[
          statSwitcherButtonStyle.button,
          statSwitcherButtonStyle.active,
          { backgroundColor: expenseActiveColor },
        ]}>
        <Icon name="format-list-bulleted" size={22} color={activeIconColor} />
        <Text
          style={[
            statSwitcherButtonStyle.text,
            statSwitcherButtonStyle.textActive,
            { color: activeTextColor },
          ]}>
          Expenses
        </Text>
      </AnimatedPressable>
      <AnimatedPressable
        style={[
          statSwitcherButtonStyle.button,
          statSwitcherButtonStyle.inactive,
          { backgroundColor: inactiveColor },
        ]}>
        <Icon
          name="account-circle"
          ios={{
            // todo: when active, it becomes person.3.fill
            name: 'person.3',
          }}
          size={22}
          color={inactiveIconColor}
        />
        <Text
          style={[
            statSwitcherButtonStyle.text,
            statSwitcherButtonStyle.textInactive,
            { color: inactiveTextColor },
          ]}>
          Members
        </Text>
      </AnimatedPressable>
      <AnimatedPressable
        style={[
          statSwitcherButtonStyle.button,
          statSwitcherButtonStyle.inactive,
          { backgroundColor: inactiveColor },
        ]}>
        <Icon
          name="chart-box"
          ios={{
            // todo: when active, it becomes chart.pie.fill
            name: 'chart.pie',
          }}
          size={22}
          color={inactiveIconColor}
        />
        <Text
          style={[
            statSwitcherButtonStyle.text,
            statSwitcherButtonStyle.textInactive,
            { color: inactiveTextColor },
          ]}>
          Stats
        </Text>
      </AnimatedPressable>
    </View>
  );
}

const statSwitcherButtonStyle = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
    height: 48,
  },
  active: {
    width: 'auto',
    paddingHorizontal: 24,
  },
  inactive: {
    width: 64,
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  textActive: {
    opacity: 1,
  },
  textInactive: {
    opacity: 0,
  },
});
