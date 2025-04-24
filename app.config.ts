import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Divvi',
  slug: 'divvi-app',
  scheme: 'divvi-app',
  version: '1.0.4',
  orientation: 'portrait',
  icon: './assets/expo/icon.png',
  userInterfaceStyle: 'automatic',
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 30000,
    url: 'https://u.expo.dev/e0518cf8-9978-4899-8052-bb43988df049',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'dev.uing.divvi',
    icon: {
      dark: './assets/expo/ios-dark.png',
      light: './assets/expo/ios-light.png',
      tinted: './assets/expo/ios-tinted.png',
    },
    associatedDomains: ['applinks:divvi-app.uing.dev', 'webcredentials:divvi-app.uing.dev'],
    entitlements: {
      'com.apple.developer.applesignin': ['Default'],
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
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
  extra: {
    eas: {
      projectId: 'e0518cf8-9978-4899-8052-bb43988df049',
    },
  },

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
    [
      'expo-font',
      {
        fonts: ['assets/fonts/SF-Pro-Rounded-Regular.otf'],
      },
    ],
    [
      'expo-contacts',
      {
        contactsPermission:
          'Allow $(PRODUCT_NAME) to access your contacts so you can invite your friends.',
      },
    ],
    'expo-updates',
  ],
});
