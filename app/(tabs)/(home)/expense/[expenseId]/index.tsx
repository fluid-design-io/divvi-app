import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import { Alert, RefreshControl, View } from 'react-native';

import { ErrorView } from '~/components/core/error-view'; //! remove or rename if you don't have ErrorView
import Loading, { LoadingOverlay } from '~/components/core/loading';
import {
  List,
  ListItem,
  ListRenderItemInfo,
  ListSectionHeader,
  ExtendedListDataItem,
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { RouterOutputs, trpc } from '~/utils/api';
import { CATEGORIES } from '~/components/screen/edit-expense-form';
import { TonalIconNative } from '~/components/core/icon';
import { SfSymbolIconName } from '@roninoss/icons';
import { formatCurrency } from '~/utils/format';
import { formatDate } from 'date-fns';
import { authClient } from '~/lib/auth/client';
import { cn } from '~/lib/cn';

type Expense = NonNullable<RouterOutputs['expense']['getById']>;

export default function ExpenseDetails() {
  const queryClient = useQueryClient();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { data: session } = authClient.useSession();
  const { data, isPending, isError, error, isRefetching, refetch } = useQuery(
    trpc.expense.getById.queryOptions({
      id: expenseId,
    })
  );

  const { mutate: deleteExpense, isPending: isDeleting } = useMutation(
    trpc.expense.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.back();
      },
    })
  );

  if (isPending) return <Loading expand />;
  if (isError)
    return <ErrorView message={error.message} onRetry={() => router.back()} retryText="Go Back" />;
  if (!data)
    return (
      <ErrorView message="Expense not found" onRetry={() => router.back()} retryText="Go Back" />
    );

  const DATA: ExtendedListDataItem[] = [
    'General Info',
    {
      id: 'paid-by',
      title: 'Paid By',
      subTitle: data.paidBy.name,
      value: data.paidBy.email,
    },
    {
      id: 'split-type',
      title: 'Split Type',
      value: data.splitType,
    },
    {
      id: 'category',
      title: 'Category',
      value: data.category,
    },

    'Splits',
    ...data.splits.map((split) => ({
      id: split.id,
      title: split.user.name,
      subTitle: formatCurrency(split.amount),
      value: `${split.percentage}%`,
    })),
    'Group',
    {
      id: 'group',
      title: data.group.name,
      subTitle: data.group.description ?? 'No description',
    },
    'Other Info',
    {
      id: 'created-at',
      title: 'Created At',
      value: formatDate(data.createdAt, 'MMM d, yyyy'),
    },
    {
      id: 'updated-at',
      title: 'Updated At',
      value: formatDate(data.updatedAt, 'MMM d, yyyy'),
    },
    // only owner can edit or delete
    ...(data.paidBy.id === session?.user.id
      ? [
          'Actions',
          {
            id: 'edit',
            title: 'Edit',
            titleClassName: 'text-primary',
            onPress: () => router.push(`/expense/${expenseId}/edit`),
          },
          {
            id: 'delete',
            title: 'Delete...',
            isDestructive: true,
            onPress: () =>
              Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteExpense({ id: expenseId }),
                },
              ]),
          },
        ]
      : []),
  ];

  return (
    <>
      <LoadingOverlay loading={isDeleting} />
      <List
        variant="insets"
        data={DATA}
        renderItem={renderItem}
        ListEmptyComponent={isPending ? <Loading /> : <ListEmpty />}
        ListHeaderComponent={<ListHeader expense={data} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      />
    </>
  );
}

function ListHeader({ expense }: { expense: Expense }) {
  return (
    <View className="mx-auto w-full max-w-lg web:rounded-2xl web:bg-card web:p-6">
      <View className="items-center justify-center">
        <TonalIconNative
          icon={{
            ios: {
              name: CATEGORIES[expense.category].ios.name as SfSymbolIconName,
            },
            name: 'info.circle',
          }}
        />
      </View>
      <View className="mb-6 gap-2">
        <Text variant="title1" className="ios:font-bold pt-4 text-center">
          {expense.title}
        </Text>
        <Text variant="body" className="px-8 text-center text-muted-foreground">
          {expense.description ?? 'No description'}
        </Text>
      </View>
    </View>
  );
}

// Displayed when the list is empty (e.g., no data).
function ListEmpty() {
  return (
    <View className="flex-1 items-center justify-center">
      <Info className="mb-2 h-6 w-6 text-muted-foreground" />
      <Text className="text-center text-sm text-muted-foreground">No items found</Text>
    </View>
  );
}

// Wrapper to pass the item info to the actual Item component
function renderItem(info: ListRenderItemInfo<ExtendedListDataItem>) {
  return <Item info={info} />;
}

// The actual ListItem (row) component.
function Item({ info }: { info: ListRenderItemInfo<ExtendedListDataItem> }) {
  useColorScheme();
  // If it's a string, treat it as a section header
  if (typeof info.item === 'string') {
    return <ListSectionHeader {...info} />;
  }

  return (
    <ListItem
      {...info}
      target="Cell"
      variant="insets"
      titleClassName={cn(info.item.titleClassName, info.item.isDestructive && 'text-destructive')}
      rightView={
        <View className="flex-1 flex-row items-center gap-0.5 px-2">
          {!!info.item.value && <Text className="text-muted-foreground">{info.item.value}</Text>}
        </View>
      }
      disabled={info.item.disabled}
      onPress={info.item.onPress}
    />
  );
}
