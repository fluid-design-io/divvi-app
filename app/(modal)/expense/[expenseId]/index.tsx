import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlinkingCursor } from '~/components/core/blinking-cursor';
import { NumericKeypad } from '~/components/core/keypad';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { expenseAtom, ExpenseDetails, SelectGroup } from '~/components/screen/edit-expense-form';
import { useKeypad } from '~/hooks/use-keypad';

import { trpc } from '~/utils/api';
import { formatCurrency } from '~/utils/format';
import Loading from '~/components/core/loading';

function NewExpenseModal() {
  const { expenseId: id, groupId } = useLocalSearchParams<{
    expenseId: string;
    groupId?: string;
  }>();
  const [expense, setExpense] = useAtom(expenseAtom);
  const { amount, handleNumberPress, clear } = useKeypad({
    initialValue: expense?.amount.toString() ?? undefined,
  });
  const isNewExpense = id === 'new';
  const { data: expenseData, isPending: isExpensePending } = useQuery(
    trpc.expense.getById.queryOptions(
      { id },
      {
        enabled: !isNewExpense,
      }
    )
  );

  useEffect(() => {
    if (amount) {
      setExpense({
        ...expenseData,
        amount: Number(amount),
      });
    }
  }, [amount]);
  useEffect(() => {
    if (groupId) {
      setExpense({
        ...expenseData,
        amount: expenseData?.amount ?? 0,
        groupId,
      });
    }
  }, [groupId]);
  if (!isNewExpense && isExpensePending) return <Loading expand />;
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
      edges={['bottom']}>
      <View className="flex flex-1 justify-between">
        <View className="p-4">
          <SelectGroup />
        </View>
        <View className="flex-1 items-center justify-center py-12">
          <View className="flex-row items-center justify-center">
            <Text className="font-rounded text-6xl">{formatCurrency(Number(amount) / 100)}</Text>
            <BlinkingCursor />
          </View>
        </View>
        <View className="gap-4 p-4">
          <ExpenseDetails />
          <NumericKeypad onNumberPress={handleNumberPress} onLongPress={clear} />
          <View className="flex-row justify-between gap-4">
            <View className="ios:flex-1">
              <Button variant="muted" onPress={() => router.dismiss()}>
                <Text>Cancel</Text>
              </Button>
            </View>
            <View className="flex-1">
              <Button
                size={Platform.select({
                  ios: 'lg',
                  default: 'md',
                })}
                disabled={!amount}
                onPress={() => {}}>
                <Text>Add</Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default NewExpenseModal;
