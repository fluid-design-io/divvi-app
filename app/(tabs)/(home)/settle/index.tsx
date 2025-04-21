import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlinkingCursor } from '~/components/core/blinking-cursor';
import { NumericKeypad } from '~/components/core/keypad';
import { Button } from '~/components/nativewindui/Button';
import { Card, CardContent } from '~/components/nativewindui/Card';
import { Text } from '~/components/nativewindui/Text';
import { useKeypad } from '~/hooks/use-keypad';
import { trpc } from '~/utils/api';
import { formatCurrency } from '~/utils/format';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { authClient } from '~/lib/auth/client';

export default function SettleScreen() {
  const queryClient = useQueryClient();
  const {
    balance: balanceString,
    memberName,
    memberId,
    groupId,
  } = useLocalSearchParams<{
    groupId: string;
    memberId: string;
    balance: string;
    memberName: string;
  }>();
  const { data: session } = authClient.useSession();

  const { mutate } = useMutation(
    trpc.settlement.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.dismiss();
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    })
  );

  const balance = Number(balanceString);
  const description =
    balance > 0
      ? `You owe ${memberName} ${formatCurrency(balance / 100)}`
      : `${memberName} owes you ${formatCurrency(Math.abs(balance) / 100)}`;
  const payerName = balance > 0 ? 'You' : memberName;
  const payeeName = balance > 0 ? memberName : 'You';

  const { amount, handleNumberPress, clear } = useKeypad({
    onAmountChange: console.log,
    initialValue: Math.abs(balance).toString(),
  });

  const handleSubmit = () => {
    if (!session) return;
    if (balance > 0) {
      mutate({
        amount: Number(amount),
        fromUserId: memberId,
        toUserId: session?.user.id,
        groupId,
      });
    } else {
      mutate({
        amount: Number(amount),
        fromUserId: session?.user.id,
        toUserId: memberId,
        groupId,
      });
    }
  };
  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="flex-1 justify-between gap-4 p-4">
          <Card>
            <CardContent>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-medium">{`Settle Up with ${memberName}`}</Text>
                  <Text className="max-w-[220px] text-sm capitalize text-muted-foreground">
                    {description}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <View className="flex-1 items-center justify-center py-12">
            <View className="flex-row items-center justify-center">
              <Text className="font-rounded text-6xl">{formatCurrency(Number(amount) / 100)}</Text>
              <BlinkingCursor />
            </View>
          </View>
          <Card>
            <CardContent>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm font-bold text-foreground">{payerName}</Text>
                <Text className="text-sm">{balance > 0 ? 'pay' : 'pays'}</Text>
                <Text className="text-sm font-bold text-foreground">{payeeName}</Text>
              </View>
            </CardContent>
          </Card>
          <NumericKeypad onNumberPress={handleNumberPress} onLongPress={clear} />
          <View className="flex-row justify-between gap-4">
            <View className="ios:flex-1">
              <Button variant="muted" onPress={() => router.dismiss()}>
                <Text>Cancel</Text>
              </Button>
            </View>
            <View className="flex-1">
              <Button onPress={() => handleSubmit()}>
                <Text>Record Payment</Text>
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
