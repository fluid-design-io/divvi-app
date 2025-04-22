import { Icon } from '@roninoss/icons';
import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  interpolateColor,
  SharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColorScheme } from '~/lib/useColorScheme';
// Define the type for a tab configuration
export type TabConfig<TabType extends string> = {
  id: TabType;
  label: string;
  icon: {
    name: string;
    ios?: {
      name: string;
      activeName?: string;
    };
  };
  activeColor?: string; // Optional custom active color for this tab
};

// Define the type for the dynamic tab switcher props
export type DynamicTabSwitcherProps<TabType extends string> = {
  tabs: TabConfig<TabType>[];
  selectedTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeColor?: string;
  inactiveColor?: string;
  activeIconColor?: string;
  inactiveIconColor?: string;
  activeTextColor?: string;
};

export function DynamicTabSwitcher<TabType extends string>({
  tabs,
  selectedTab,
  onSelectTab,
  activeColor,
  inactiveColor,
  activeIconColor,
  inactiveIconColor,
  activeTextColor,
}: DynamicTabSwitcherProps<TabType>) {
  const { colors } = useColorScheme();

  // Use provided colors or fallback to theme colors
  const defaultActiveColor = activeColor || colors.primary;
  const finalInactiveColor = inactiveColor || colors.grey5;
  const finalActiveIconColor = activeIconColor || '#ffffff';
  const finalInactiveIconColor = inactiveIconColor || colors.grey;
  const finalActiveTextColor = activeTextColor || '#ffffff';

  // State to store measured widths
  const [tabWidths, setTabWidths] = useState<Record<TabType, number>>(
    {} as Record<TabType, number>
  );

  // Animation values
  const tabAnimations = tabs.reduce(
    (acc, tab) => {
      acc[tab.id] = useSharedValue(selectedTab === tab.id ? 1 : 0);
      return acc;
    },
    {} as Record<TabType, SharedValue<number>>
  );

  // Update animation values when selectedTab changes
  useEffect(() => {
    tabs.forEach((tab) => {
      tabAnimations[tab.id].value = withSpring(selectedTab === tab.id ? 1 : 0, {
        stiffness: 100,
        damping: 20,
        mass: 0.8,
      });
    });
  }, [selectedTab]);

  // Handle width measurement
  const handleWidthMeasurement = (tabId: TabType, width: number) => {
    setTabWidths((prev) => ({
      ...prev,
      [tabId]: width,
    }));
  };

  // Create animated styles for each tab
  const tabStyles = tabs.reduce(
    (acc, tab) => {
      acc[tab.id] = useAnimatedStyle(() => {
        // Use tab-specific active color if available, otherwise use the default
        const tabActiveColor = tab.activeColor || defaultActiveColor;
        const measuredWidth = tabWidths[tab.id];

        return {
          width: interpolate(tabAnimations[tab.id].value, [0, 1], [64, measuredWidth]),
          backgroundColor: interpolateColor(
            tabAnimations[tab.id].value,
            [0, 1],
            [finalInactiveColor, tabActiveColor]
          ),
        };
      });
      return acc;
    },
    {} as Record<TabType, any>
  );

  // Create animated styles for text opacity
  const textStyles = tabs.reduce(
    (acc, tab) => {
      acc[tab.id] = useAnimatedStyle(() => {
        return {
          opacity: tabAnimations[tab.id].value,
        };
      });
      return acc;
    },
    {} as Record<TabType, any>
  );

  return (
    <View className="-mt-2 mb-6 flex-row items-center gap-2">
      {/* Hidden measurement components */}
      <View
        style={{
          position: 'absolute',
          opacity: 0,
          height: 'auto',
          backgroundColor: 'blue',
          alignItems: 'center',
        }}>
        {tabs.map((tab) => (
          <View
            key={`measure-${tab.id}`}
            onLayout={(event: LayoutChangeEvent) => {
              const { width } = event.nativeEvent.layout;
              handleWidthMeasurement(tab.id, width);
            }}
            style={{
              backgroundColor: 'green',
            }}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24 }}>
              <Icon name={tab.icon.name as any} size={22} color="red" />
              <Text style={statSwitcherButtonStyle.text} numberOfLines={1} ellipsizeMode="tail">
                {tab.label}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Visible tab buttons */}
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isSelected={selectedTab === tab.id}
          onPress={() => onSelectTab(tab.id)}
          style={tabStyles[tab.id]}
          textStyle={textStyles[tab.id]}
          activeIconColor={finalActiveIconColor}
          inactiveIconColor={finalInactiveIconColor}
          activeTextColor={finalActiveTextColor}
        />
      ))}
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabButton<TabType extends string>({
  tab,
  isSelected,
  onPress,
  style,
  textStyle,
  activeIconColor,
  inactiveIconColor,
  activeTextColor,
}: {
  tab: TabConfig<TabType>;
  isSelected: boolean;
  onPress: () => void;
  style: any;
  textStyle: any;
  activeIconColor: string;
  inactiveIconColor: string;
  activeTextColor: string;
}) {
  return (
    <AnimatedPressable style={[statSwitcherButtonStyle.button, style]} onPress={onPress}>
      <Animated.View className="-ml-2 h-8 w-8 items-center justify-center">
        <Icon
          name={tab.icon.name as any}
          ios={{
            name: (isSelected && tab.icon.ios?.activeName
              ? tab.icon.ios.activeName
              : tab.icon.ios?.name || tab.icon.name) as any,
          }}
          size={22}
          color={isSelected ? activeIconColor : inactiveIconColor}
        />
      </Animated.View>
      <Animated.Text
        style={[statSwitcherButtonStyle.text, textStyle, { color: activeTextColor }]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {tab.label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const statSwitcherButtonStyle = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
    height: 48,
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
