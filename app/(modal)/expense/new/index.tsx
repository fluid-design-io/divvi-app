import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useExistingGroup } from '~/hooks/use-existing-group';

import { queryClient, trpc } from '~/utils/api';
import { formatCurrency } from '~/utils/format';
import Loading from '~/components/core/loading';
import { useEffect } from 'react';
import { authClient } from '~/lib/auth/client';

// help to check uuid format

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

  const { selectedGroup, isLoading: isLoadingExistingGroup } = useExistingGroup(existingGroupId);

  const {
    data: newGroupData,
    mutate: initializeGroup,
    isPending: isInitializingGroup,
  } = useMutation(
    trpc.group.initialize.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        console.log('🔥 error', error);
      },
    })
  );

  const finalSelectedGroup = selectedGroup ?? newGroupData;

  useEffect(() => {
    if (isInitialized) return;
    if (!session?.user.id) return;
    if (isLoadingExistingGroup) return;
    if (!finalSelectedGroup && !isInitializingGroup) {
      initializeGroup();
      return;
    }
    if (!finalSelectedGroup) return;
    let expenseData: CreateExpenseSchemaType | undefined = undefined;
    if (!expenseData) {
      expenseData = {
        amount: 0,
        groupId: finalSelectedGroup.id,
        paidById: session.user.id,
        splits: [],
      };
    }
    initialize(expenseData, finalSelectedGroup);
  }, [
    finalSelectedGroup,
    isInitialized,
    session?.user.id,
    isInitializingGroup,
    isLoadingExistingGroup,
  ]);

  if (!finalSelectedGroup)
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Loading expand />
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'space-between',
      }}
      edges={['bottom']}>
      <View className="p-4">
        <SelectGroup group={finalSelectedGroup} />
      </View>
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center justify-center">
          <Text className="font-rounded text-6xl">{formatCurrency(Number(amount) / 100)}</Text>
          <BlinkingCursor />
        </View>
      </View>
      <View className="gap-4 p-4">
        <ExpenseDetails groupId={finalSelectedGroup.id} />
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
