import '../global.css';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { queryClient } from '~/utils/api';

import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useInitialAndroidBarSync();
  const [loaded, error] = useFonts({
    'SF-Pro-Rounded-Regular': require('../assets/fonts/SF-Pro-Rounded-Regular.otf'),
  });
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
        animated
      />

      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
                <NavThemeProvider value={NAV_THEME[colorScheme]}>
                  <Stack screenOptions={SCREEN_OPTIONS}>
                    <Stack.Screen name="(tabs)" options={TABS_OPTIONS} />
                    <Stack.Screen name="(auth)" options={AUTH_OPTIONS} />
                    <Stack.Screen name="(modal)" options={MODAL_OPTIONS} />
                    <Stack.Screen name="add-expense" options={ADD_EXPENSE_OPTIONS} />
                  </Stack>
                  <PortalHost />
                </NavThemeProvider>
              </KeyboardProvider>
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const TABS_OPTIONS = {
  headerShown: false,
} as const;

const AUTH_OPTIONS = {
  // presentation: 'modal',
  // animation: 'fade_from_bottom', // for android
  title: 'Auth',
} as const;

const MODAL_OPTIONS = {
  presentation: 'modal',
  headerShown: false,
} as const;

const ADD_EXPENSE_OPTIONS = {
  presentation: 'formSheet',
  headerShown: false,
  sheetAllowedDetents: 'fitToContents',
} as const;
