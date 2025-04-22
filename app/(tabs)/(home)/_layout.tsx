import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen
        name="settle/index"
        options={{
          title: 'Settle Up',
          presentation: 'formSheet',
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
          headerShown: false,
          sheetGrabberVisible: true,
          sheetInitialDetentIndex: 0,
          sheetAllowedDetents: 'fitToContents',
        }}
      />
      <Stack.Screen
        name="expense/[expenseId]/index"
        options={{
          title: '',
          headerShadowVisible: false,
          headerBlurEffect: 'none',
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="expense/[expenseId]/edit"
        options={{
          title: '',
          presentation: 'formSheet',
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
          sheetGrabberVisible: true,
          sheetInitialDetentIndex: 0,
          sheetAllowedDetents: 'fitToContents',
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
