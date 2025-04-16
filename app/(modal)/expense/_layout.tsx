import { Stack } from 'expo-router';

function ExpenseModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="new" />
      <Stack.Screen name="[id]/index" />
    </Stack>
  );
}

export default ExpenseModalLayout;
