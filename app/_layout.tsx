import '../global.css';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TRPCReactProvider } from '~/lib/trpc/react';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
        animated
      />

      <TRPCReactProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <NavThemeProvider value={NAV_THEME[colorScheme]}>
                <Stack screenOptions={SCREEN_OPTIONS}>
                  <Stack.Screen name="(drawer)" options={DRAWER_OPTIONS} />
                  <Stack.Screen name="(auth)" options={AUTH_OPTIONS} />
                  <Stack.Screen name="add-expense"
                    options={ADD_EXPENSE_OPTIONS}
                  />
                </Stack>
              </NavThemeProvider>
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </TRPCReactProvider>
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const DRAWER_OPTIONS = {
  headerShown: false,
} as const;


const AUTH_OPTIONS = {
  // presentation: 'modal',
  // animation: 'fade_from_bottom', // for android
  title: 'Auth',
} as const;

const ADD_EXPENSE_OPTIONS = {
  presentation: "formSheet",
  headerShown: false,
  sheetAllowedDetents: 'fitToContents',
} as const;