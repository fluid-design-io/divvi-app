import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlinkingCursor } from '~/components/core/blinking-cursor';
import { NumericKeypad } from '~/components/core/keypad';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import {
  ExpenseDetails,
  SelectGroup,
  CreateExpenseSchemaType,
  useExpenseStore,
} from '~/components/screen/edit-expense-form';
import { useKeypad } from '~/hooks/use-keypad';

import { queryClient, trpc } from '~/utils/api';
import { formatCurrency } from '~/utils/format';
import Loading from '~/components/core/loading';
import { useEffect } from 'react';
import { authClient } from '~/lib/auth/client';

// help to check uuid format
function isUUID(str: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
}

function NewExpenseModal() {
  const { groupId: existingGroupId } = useLocalSearchParams<{
    groupId?: string;
  }>();
  const { data: session } = authClient.useSession();
  const initialize = useExpenseStore((s) => s.initialize);
  const isInitialized = useExpenseStore((s) => s.isInitialized);
  const updateAmount = useExpenseStore((s) => s.updateAmount);
  const { amount, handleNumberPress, clear } = useKeypad({
    onAmountChange: updateAmount,
  });
  const { data: mostRecentGroupData, isPending: isMostRecentGroupPending } = useQuery(
    trpc.group.getMostRecentGroup.queryOptions(undefined, {
      enabled: !isUUID(existingGroupId ?? ''),
    })
  );
  const { data: selectedGroupData, isPending: isSelectedGroupPending } = useQuery(
    trpc.group.getById.queryOptions(
      { groupId: existingGroupId! },
      {
        enabled: isUUID(existingGroupId!),
      }
    )
  );
  const isLoadingExistingGroup = isMostRecentGroupPending || isSelectedGroupPending;

  const {
    data: newGroupData,
    mutate: initializeGroup,
    isPending: isInitializingGroup,
  } = useMutation(
    trpc.group.initialize.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    })
  );

  const selectedGroup = selectedGroupData ?? mostRecentGroupData ?? newGroupData;

  useEffect(() => {
    if (isInitialized) return;
    if (!session?.user.id) return;
    if (isLoadingExistingGroup) return;
    if (!selectedGroup && !isInitializingGroup) {
      initializeGroup();
      return;
    }
    if (!selectedGroup) return;
    let expenseData: CreateExpenseSchemaType | undefined = undefined;
    if (!expenseData) {
      expenseData = {
        amount: 0,
        groupId: selectedGroup.id,
        paidById: session.user.id,
        splits: [],
      };
    }
    initialize(expenseData, selectedGroup);
  }, [selectedGroup, isInitialized, session?.user.id, isInitializingGroup, isLoadingExistingGroup]);

  if (!selectedGroup) return <Loading expand />;
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
      edges={['bottom']}>
      <View className="flex flex-1 justify-between">
        <View className="p-4">
          <SelectGroup group={selectedGroup} />
        </View>
        <View className="flex-1 items-center justify-center py-12">
          <View className="flex-row items-center justify-center">
            <Text className="font-rounded text-6xl">{formatCurrency(Number(amount) / 100)}</Text>
            <BlinkingCursor />
          </View>
        </View>
        <View className="gap-4 p-4">
          <ExpenseDetails groupId={selectedGroup.id} />
          <NumericKeypad onNumberPress={handleNumberPress} onLongPress={clear} />
          <View className="flex-row justify-between gap-4">
            <View className="ios:flex-1">
              <Button variant="muted" onPress={() => router.dismiss()}>
                <Text>Cancel</Text>
              </Button>
            </View>
            <View className="flex-1">
              <AddExpenseButton />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const AddExpenseButton = () => {
  const queryClient = useQueryClient();
  const { mutate: createExpense, isPending: isCreatingExpense } = useMutation(
    trpc.expense.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.dismiss();
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    })
  );

  const expense = useExpenseStore((s) => s.expense);
  if (!expense) return null;
  return (
    <Button
      size={Platform.select({
        ios: 'lg',
        default: 'md',
      })}
      disabled={!expense.amount || isCreatingExpense}
      onPress={() => {
        createExpense({
          ...expense,
          amount: Number(expense.amount),
        });
      }}>
      <Text>{isCreatingExpense ? 'Adding...' : 'Add'}</Text>
    </Button>
  );
};
export default NewExpenseModal;
