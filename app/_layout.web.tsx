import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { NAV_THEME } from '~/theme';

import '../global.css';

export default function WebLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <NavThemeProvider value={NAV_THEME[colorScheme]}>
      <Stack initialRouteName="(web)/index">
        <Stack.Screen name="(web)/index" options={WEB_OPTIONS} />
        <Stack.Screen name="(aux)/privacy-policy" options={AUX_OPTIONS} />
        <Stack.Screen name="(aux)/terms-of-use" options={AUX_OPTIONS} />
      </Stack>
    </NavThemeProvider>
  );
}

const AUX_OPTIONS = {
  headerShown: true,
} as const;

const WEB_OPTIONS = {
  headerShown: false,
} as const;
