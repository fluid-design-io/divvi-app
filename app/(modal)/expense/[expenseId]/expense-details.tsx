import { Text } from '~/components/nativewindui/Text';
import { Picker } from '@expo/ui/Picker';
import { useState } from 'react';
import { router, Stack, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import { BodyScrollView } from '~/components/core/body-scroll-view';
import { Button } from '~/components/nativewindui/Button';
import { View } from 'react-native';
export default function ExpenseDetails() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { groupId } = useGlobalSearchParams<{ groupId: string }>();
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Expense Details',
          headerTitle: 'Expense Details',
          headerShown: true,
          headerRight: () => (
            <Button variant="plain" size="none" onPress={() => router.back()}>
              <Text className="text-primary">Done</Text>
            </Button>
          ),
        }}
      />

      <BodyScrollView contentContainerClassName="p-4">
        <Text className="font-semibold" variant="title2">
          Expense Details
        </Text>
        <Text>How do you want to split this expense?</Text>
        <View className="my-4 items-center">
          <Picker
            options={['Equal', 'Percentage', 'Custom']}
            selectedIndex={selectedIndex}
            onOptionSelected={({ nativeEvent: { index } }) => {
              setSelectedIndex(index);
            }}
          />
        </View>
        <View>
          <Text>GroupID: {groupId}</Text>
          <Text>ExpenseID: {expenseId}</Text>
        </View>
      </BodyScrollView>
    </>
  );
}
