import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Divvi',
  slug: 'divvi-app',
  version: '1.0.0',
  owner: 'cardware',
  scheme: 'divvi-app',
  web: {
    bundler: 'metro',
    output: 'server',
    favicon: './assets/expo/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
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
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  orientation: 'portrait',
  icon: './assets/expo/icon.png',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cardware.divvi',
    icon: {
      dark: './assets/expo/ios-dark.png',
      light: './assets/expo/ios-light.png',
      tinted: './assets/expo/ios-tinted.png',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/expo/adaptive-icon.png',
      backgroundColor: '#ffffffff',
    },
    package: 'com.cardware.divvi',
  },
};

export default config;
