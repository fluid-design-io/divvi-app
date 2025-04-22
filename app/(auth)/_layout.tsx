import { Stack } from 'expo-router';

function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="link-account" options={{ headerShown: true, title: 'Link Account' }} />
    </Stack>
  );
}

export default AuthLayout;
