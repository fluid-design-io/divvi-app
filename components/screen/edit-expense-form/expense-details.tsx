import { Icon } from '@roninoss/icons';
import { View } from 'react-native';
import { TouchableBounce } from '~/components/core/touchable-bounce';
import { Card, CardContent, CardDescription } from '~/components/nativewindui/Card';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

export const ExpenseDetails = () => {
  const { colors } = useColorScheme();
  return (
    <TouchableBounce>
      <Card>
        <CardContent>
          <View className="flex-row items-center justify-between">
            <View>
              <CardDescription className="text-xs">Expense Details</CardDescription>
              <Text className="font-medium">Dinner</Text>
              <Text className="max-w-[220px] text-sm text-muted-foreground">
                {'Equal • $100.00/person'}
                {/* {"Percent • 30% of total"} */}
                {/* {"Custom • $100.00"} */}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.grey2} />
          </View>
        </CardContent>
      </Card>
    </TouchableBounce>
  );
};
