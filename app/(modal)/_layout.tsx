import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function ModalLayout() {
  return (
    <>
      <BottomSheetModalProvider>
        <Stack screenOptions={SCREEN_OPTIONS}>
          <Stack.Screen name="profile/name" options={FORM_SCREEN_OPTIONS} />
          <Stack.Screen name="profile/notifications" options={FORM_SCREEN_OPTIONS} />
        </Stack>
      </BottomSheetModalProvider>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} animated />
    </>
  );
}

const SCREEN_OPTIONS = {
  headerTransparent: Platform.OS === 'ios',
  headerBlurEffect: 'systemMaterial',
  headerShown: false,
} as const;

const FORM_SCREEN_OPTIONS = {
  headerTitle: '',
  headerShown: true,
  headerTransparent: true,
  headerBlurEffect: undefined,
} as const;
