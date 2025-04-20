import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon, IconProps } from '@roninoss/icons';
import { Redirect, router, Stack, Tabs, useGlobalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Platform, Pressable, PressableProps, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BlurTabBarBackground from '~/components/core/tab-bar-background/tab-bar-background.ios';
import { TouchableBounce } from '~/components/core/touchable-bounce';
import AddExpenseIcon from '~/components/icon/add-expense';
import { Badge } from '~/components/nativewindui/Badge';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

export default function TabLayout() {
  const { colors } = useColorScheme();
  const insets = useSafeAreaInsets();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Tabs' }} />
      <Tabs
        tabBar={TAB_BAR}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarStyle: {
            backgroundColor: colors.grey5,
            marginBottom: insets.bottom + 12,
            paddingTop: 12,
            paddingBottom: 0,
            height: 60,
            marginHorizontal: 24,
            borderRadius: 100,
          },
          tabBarShowLabel: false,
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
  return (
    <View
      style={{
        paddingBottom: insets.bottom + 12,
      }}
      className="border-t-border/25 flex-row border-t bg-card pb-4 pt-3 dark:border-t-0">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <MaterialTabItem
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            name={TAB_ICON[route.name as keyof typeof TAB_ICON]}
            isFocused={isFocused}
            badge={options.tabBarBadge}
            label={
              typeof label === 'function'
                ? label({
                    focused: isFocused,
                    color: isFocused ? colors.foreground : colors.grey2,
                    children: options.title ?? route.name ?? '',
                    position: options.tabBarLabelPosition ?? 'below-icon',
                  })
                : label
            }
          />
        );
      })}
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

  return (
    <View
      className="absolute bottom-0 left-0 right-0 items-center justify-center"
      style={{
        marginBottom: insets.bottom + 12,
      }}>
      <View className="relative flex-row items-center overflow-hidden rounded-full">
        <BlurTabBarBackground tint="systemThinMaterial" intensity={100} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          return (
            <React.Fragment key={route.name}>
              <IosTabItem
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                isFocused={isFocused}
                name={TAB_ICON_SF[route.name as keyof typeof TAB_ICON_SF]}
                label={label as string}
                badge={options.tabBarBadge}
              />
              {index === 0 && <AddExpenseTabItem key="add" />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
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
    <TouchableBounce className="items-center" {...(pressableProps as any)}>
      <View className="relative items-center justify-center gap-1 p-4">
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
        {!!badge && <Badge>{badge}</Badge>}
      </View>
    </TouchableBounce>
  );
}

function AddExpenseTabItem() {
  const { groupId } = useGlobalSearchParams<{ groupId?: string }>();
  return (
    <View className="items-center">
      <Pressable
        className="relative items-center justify-center gap-1 p-4"
        onPress={() => router.push(`/expense/new?groupId=${groupId}`)}>
        <AddExpenseIcon />
      </Pressable>
    </View>
  );
}
