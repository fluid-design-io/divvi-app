import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function ModalLayout() {
  return (
    <>
      <BottomSheetModalProvider>
        <Stack screenOptions={SCREEN_OPTIONS} />
      </BottomSheetModalProvider>
      <PortalHost name="modal" />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} animated />
    </>
  );
}

const SCREEN_OPTIONS = {
  headerTransparent: Platform.OS === 'ios',
  headerBlurEffect: 'systemMaterial',
  headerShown: false,
} as const;
