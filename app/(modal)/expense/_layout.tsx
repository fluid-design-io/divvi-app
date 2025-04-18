import { Stack } from 'expo-router';

function ExpenseModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: 'Expense',
        headerTitle: 'Expense',
      }}>
      <Stack.Screen
        name="[expenseId]/index"
        options={{
          title: 'Expense',
        }}
      />
      <Stack.Screen
        name="[expenseId]/select-group"
        options={{
          title: 'Select Group',
        }}
      />
    </Stack>
  );
}

export default ExpenseModalLayout;
