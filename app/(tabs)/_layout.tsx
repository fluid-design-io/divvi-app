import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon, IconProps } from '@roninoss/icons';
import { Redirect, router, Stack, Tabs, useGlobalSearchParams, useSegments } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Platform, Pressable, PressableProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BlurTabBarBackground from '~/components/core/tab-bar-background/tab-bar-background.ios';
import AddExpenseIcon from '~/components/icon/add-expense';
import { Badge } from '~/components/nativewindui/Badge';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

export default function TabLayout() {
  const { colors } = useColorScheme();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Divvi' }} />
      <Tabs
        tabBar={TAB_BAR}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
        }}>
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Tabs>
    </>
  );
}

const TAB_BAR = Platform.select({
  ios: (props: BottomTabBarProps) => <IosTabBar {...props} />,
  android: (props: BottomTabBarProps) => <MaterialTabBar {...props} />,
});

const TAB_ICON = {
  '(home)': 'newspaper',
  profile: 'person',
} as const;

const TAB_ICON_SF = {
  '(home)': {
    name: 'rectangle.stack.fill',
    symbolEffect: {
      type: 'bounce',
      animateBy: 'layer',
      direction: 'down',
    },
  },
  profile: {
    name: 'person.crop.circle.fill',
    symbolEffect: {
      type: 'bounce',
      direction: 'down',
    },
  },
} as const;
function MaterialTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useColorScheme();
  const insets = useSafeAreaInsets();

  // Get the first tab (home)
  const homeRoute = state.routes[0];
  const homeOptions = descriptors[homeRoute.key].options;
  const homeLabel =
    homeOptions.tabBarLabel !== undefined
      ? homeOptions.tabBarLabel
      : homeOptions.title !== undefined
        ? homeOptions.title
        : homeRoute.name;
  const isHomeFocused = state.index === 0;

  // Get the second tab (profile)
  const profileRoute = state.routes[1];
  const profileOptions = descriptors[profileRoute.key].options;
  const profileLabel =
    profileOptions.tabBarLabel !== undefined
      ? profileOptions.tabBarLabel
      : profileOptions.title !== undefined
        ? profileOptions.title
        : profileRoute.name;
  const isProfileFocused = state.index === 1;

  // Home tab press handler
  const onHomePress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: homeRoute.key,
      canPreventDefault: true,
    });

    if (!isHomeFocused && !event.defaultPrevented) {
      navigation.navigate(homeRoute.name, homeRoute.params);
    }
  };

  // Profile tab press handler
  const onProfilePress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: profileRoute.key,
      canPreventDefault: true,
    });

    if (!isProfileFocused && !event.defaultPrevented) {
      navigation.navigate(profileRoute.name, profileRoute.params);
    }
  };

  return (
    <View
      style={{
        paddingBottom: insets.bottom + 12,
      }}
      className="border-t-border/25 flex-row border-t bg-card pb-4 pt-3 dark:border-t-0">
      {/* Home Tab */}
      <MaterialTabItem
        accessibilityRole="button"
        accessibilityState={isHomeFocused ? { selected: true } : {}}
        accessibilityLabel={homeOptions.tabBarAccessibilityLabel}
        onPress={onHomePress}
        name={TAB_ICON['(home)']}
        isFocused={isHomeFocused}
        badge={homeOptions.tabBarBadge}
        label={
          typeof homeLabel === 'function'
            ? homeLabel({
                focused: isHomeFocused,
                color: isHomeFocused ? colors.foreground : colors.grey2,
                children: homeOptions.title ?? homeRoute.name ?? '',
                position: homeOptions.tabBarLabelPosition ?? 'below-icon',
              })
            : homeLabel
        }
      />

      {/* Add Expense Button */}
      <AddExpenseTabItem />

      {/* Profile Tab */}
      <MaterialTabItem
        accessibilityRole="button"
        accessibilityState={isProfileFocused ? { selected: true } : {}}
        accessibilityLabel={profileOptions.tabBarAccessibilityLabel}
        onPress={onProfilePress}
        name={TAB_ICON['profile']}
        isFocused={isProfileFocused}
        badge={profileOptions.tabBarBadge}
        label={
          typeof profileLabel === 'function'
            ? profileLabel({
                focused: isProfileFocused,
                color: isProfileFocused ? colors.foreground : colors.grey2,
                children: profileOptions.title ?? profileRoute.name ?? '',
                position: profileOptions.tabBarLabelPosition ?? 'below-icon',
              })
            : profileLabel
        }
      />
    </View>
  );
}

function MaterialTabItem({
  isFocused,
  name = 'star',
  badge,
  className,
  label,
  ...pressableProps
}: {
  isFocused: boolean;
  name: IconProps<'material'>['name'];
  label: string | React.ReactNode;
  badge?: number | string;
} & Omit<PressableProps, 'children'>) {
  const { colors } = useColorScheme();
  const isFocusedDerived = useDerivedValue(() => isFocused);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      transform: [{ scaleX: withTiming(isFocusedDerived.value ? 1 : 0, { duration: 200 }) }],
      opacity: withTiming(isFocusedDerived.value ? 1 : 0, { duration: 200 }),
      bottom: 0,
      top: 0,
      left: 0,
      right: 0,
      borderRadius: 100,
    };
  });
  return (
    <Pressable className={cn('flex-1 items-center', className)} {...pressableProps}>
      <View className="h-8 w-16 items-center justify-center overflow-hidden rounded-full ">
        <Animated.View style={animatedStyle} className="bg-secondary/70 dark:bg-secondary" />
        <View>
          <Icon
            ios={{ useMaterialIcon: true }}
            size={24}
            name={name}
            color={isFocused ? colors.foreground : colors.grey2}
          />
          {!!badge && <Badge>{badge}</Badge>}
        </View>
      </View>
      <Text variant="caption2" className={cn('pt-1', !isFocused && 'text-muted-foreground')}>
        {label}
      </Text>
    </Pressable>
  );
}

function IosTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  // Get the first tab (home)
  const homeRoute = state.routes[0];
  const homeOptions = descriptors[homeRoute.key].options;
  const homeLabel =
    homeOptions.tabBarLabel !== undefined
      ? homeOptions.tabBarLabel
      : homeOptions.title !== undefined
        ? homeOptions.title
        : homeRoute.name;
  const isHomeFocused = state.index === 0;

  // Get the second tab (profile)
  const profileRoute = state.routes[1];
  const profileOptions = descriptors[profileRoute.key].options;
  const profileLabel =
    profileOptions.tabBarLabel !== undefined
      ? profileOptions.tabBarLabel
      : profileOptions.title !== undefined
        ? profileOptions.title
        : profileRoute.name;
  const isProfileFocused = state.index === 1;

  // Home tab press handler
  const onHomePress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: homeRoute.key,
      canPreventDefault: true,
    });

    if (!isHomeFocused && !event.defaultPrevented) {
      navigation.navigate(homeRoute.name, homeRoute.params);
    }
  };

  // Profile tab press handler
  const onProfilePress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: profileRoute.key,
      canPreventDefault: true,
    });

    if (!isProfileFocused && !event.defaultPrevented) {
      navigation.navigate(profileRoute.name, profileRoute.params);
    }
  };

  const isHome = segments[1] === '(home)' && segments.length === 2;
  const isProfile = segments[1] === 'profile' && segments.length === 2;
  const showBottomBar = isHome || isProfile;

  // Animation values
  const translateY = useDerivedValue(() => {
    return withSpring(showBottomBar ? 0 : 100, { damping: 20, mass: 0.8, stiffness: 100 });
  });

  const opacity = useDerivedValue(() => {
    return withTiming(showBottomBar ? 1 : 0, { duration: 300 });
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 items-center justify-center"
      style={[
        {
          marginBottom: insets.bottom + 12,
        },
        animatedStyle,
      ]}>
      <View
        className="relative flex-row items-center justify-center overflow-hidden rounded-full"
        pointerEvents={showBottomBar ? 'auto' : 'none'}>
        <BlurTabBarBackground tint="systemThinMaterial" intensity={100} />

        {/* Home Tab */}
        <IosTabItem
          accessibilityRole="button"
          accessibilityState={isHomeFocused ? { selected: true } : {}}
          accessibilityLabel={homeOptions.tabBarAccessibilityLabel}
          onPress={onHomePress}
          isFocused={isHomeFocused}
          name={TAB_ICON_SF['(home)']}
          label={homeLabel as string}
          badge={homeOptions.tabBarBadge}
        />

        {/* Add Expense Button */}
        <AddExpenseTabItem />

        {/* Profile Tab */}
        <IosTabItem
          accessibilityRole="button"
          accessibilityState={isProfileFocused ? { selected: true } : {}}
          accessibilityLabel={profileOptions.tabBarAccessibilityLabel}
          onPress={onProfilePress}
          isFocused={isProfileFocused}
          name={TAB_ICON_SF['profile']}
          label={profileLabel as string}
          badge={profileOptions.tabBarBadge}
        />
      </View>
    </Animated.View>
  );
}

function IosTabItem({
  isFocused,
  name,
  label,
  badge,
  ...pressableProps
}: {
  isFocused: boolean;
  name: (typeof TAB_ICON_SF)[keyof typeof TAB_ICON_SF];
  label: string | React.ReactNode;
  badge?: number | string;
} & Omit<PressableProps, 'children'>) {
  const { colors } = useColorScheme();
  const [isBouncing, setIsBouncing] = React.useState(false);
  React.useEffect(() => {
    if (isFocused) {
      setIsBouncing(!isBouncing);
    }
  }, [isFocused]);
  return (
    <Pressable
      {...pressableProps}
      style={{
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Icon
        ios={{
          name: name?.name,
          symbolEffect: { ...name.symbolEffect, value: isBouncing },
        }}
        size={27}
        color={isFocused ? colors.primary : colors.grey2}
        namingScheme="sfSymbol"
        materialIcon={{
          name: 'info',
          type: 'MaterialIcons',
        }}
      />
    </Pressable>
  );
}

function AddExpenseTabItem() {
  const { groupId } = useGlobalSearchParams<{ groupId?: string }>();
  return (
    <View className="items-center">
      <Pressable
        className="relative items-center justify-center gap-1 p-4"
        onPress={() => router.push({ pathname: '/expense/new', params: { groupId } })}>
        <AddExpenseIcon />
      </Pressable>
    </View>
  );
}
