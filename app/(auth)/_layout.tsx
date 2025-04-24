import { Stack } from 'expo-router';

function AuthLayout() {
  return (
    <Stack initialRouteName="sign-in">
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="link-account" options={{ headerShown: true, title: 'Link Account' }} />
      <Stack.Screen
        name="manage-account"
        options={{ headerShown: true, title: 'Manage Account' }}
      />
    </Stack>
  );
}

export default AuthLayout;
