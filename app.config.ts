import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Divvi',
  slug: 'divvi-app',
  scheme: 'divvi-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/expo/icon.png',
  userInterfaceStyle: 'automatic',
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'dev.uing.divvi',
    icon: {
      dark: './assets/expo/ios-dark.png',
      light: './assets/expo/ios-light.png',
      tinted: './assets/expo/ios-tinted.png',
    },
  },
  android: {
    package: 'dev.uing.divvi',
    adaptiveIcon: {
      foregroundImage: './assets/expo/adaptive-icon.png',
      backgroundColor: '#ffffffff',
    },
  },
  web: {
    output: 'server',
  },
  // extra: {
  //   eas: {
  //     projectId: "your-eas-project-id",
  //   },
  // },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    'expo-router',
    'expo-web-browser',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#5EB326',
        image: './assets/expo/splash-icon-light.png',
        dark: {
          image: './assets/expo/splash-icon-dark.png',
          backgroundColor: '#4F842C',
        },
        imageWidth: 48,
      },
    ],
  ],
});
