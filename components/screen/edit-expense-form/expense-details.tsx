import { Icon } from '@roninoss/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { TouchableBounce } from '~/components/core/touchable-bounce';
import { Card, CardContent, CardDescription } from '~/components/nativewindui/Card';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { useDisplayInfo, useExpenseStore } from './expense-store-provider';

export const ExpenseDetails = ({ groupId }: { groupId: string }) => {
  const { colors } = useColorScheme();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { expenseAmount, splitMode, userPayDescription } = useDisplayInfo();
  const title = useExpenseStore((s) => s.expense?.title);
  const handlePress = () => {
    if (expenseAmount === 0) {
      Alert.alert('Please enter an amount');
      return;
    }
    router.push(
      {
        pathname: './expense-details',
        params: { groupId },
      },
      {
        relativeToDirectory: true,
      }
    );
  };

  return (
    <TouchableBounce onPress={handlePress}>
      <Card>
        <CardContent>
          <View className="flex-row items-center justify-between">
            <View>
              <CardDescription className="text-xs">Expense Details {expenseId}</CardDescription>
              <Text className="font-medium">{title ?? 'New Expense'}</Text>
              <Text className="max-w-[220px] text-sm capitalize text-muted-foreground">
                {`${splitMode} • ${userPayDescription}`}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.grey2} />
          </View>
        </CardContent>
      </Card>
    </TouchableBounce>
  );
};
