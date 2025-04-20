import { Stack } from 'expo-router';
import { ExpenseStoreProvider } from '~/components/screen/edit-expense-form';

function ExpenseModalLayout() {
  return (
    <ExpenseStoreProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          title: 'Expense',
          headerTitle: 'Expense',
        }}>
        <Stack.Screen
          name="new/index"
          options={{
            title: 'Expense',
          }}
        />
        <Stack.Screen
          name="new/select-group"
          options={{
            title: 'Select Group',
          }}
        />
        <Stack.Screen
          name="new/expense-details"
          options={{
            title: 'Expense Details',
          }}
        />
      </Stack>
    </ExpenseStoreProvider>
  );
}

export default ExpenseModalLayout;
