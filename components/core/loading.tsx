import { Portal } from '@rn-primitives/portal';
import { BlurView } from 'expo-blur';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '../nativewindui/Text';

import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

function Loading({
  className,
  expand,
  color,
  variant = 'default',
}: {
  className?: string;
  expand?: boolean;
  color?: 'primary' | 'white' | 'foreground';
  variant?: 'default' | 'button';
}) {
  const { colors } = useColorScheme();
  let colorValue: string = colors.primary;
  if (color === 'white') colorValue = 'white';
  if (color === 'foreground') colorValue = colors.foreground;

  return (
    <View
      className={cn(
        expand ? 'flex-1' : 'w-full',
        'items-center justify-center',
        variant === 'button' && 'ios:h-[26px] h-6',
        className
      )}>
      <ActivityIndicator color={colorValue} />
    </View>
  );
}

export default Loading;

export const LoadingOverlay = ({
  loading,
  hostName,
  text,
}: {
  loading: boolean;
  hostName?: string;
  text?: string;
}) => {
  if (!loading) return null;
  return (
    <Portal name="loading-overlay" hostName={hostName}>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={
          (StyleSheet.absoluteFill,
          {
            width: '100%',
            height: '100%',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          })
        }>
        <View className="ios:bg-transparent overflow-hidden rounded-xl bg-background">
          <BlurView
            intensity={100}
            tint="systemMaterialDark"
            className="items-center justify-center p-4">
            <View className="h-24 min-w-24 items-center justify-center">
              <ActivityIndicator color="white" />
            </View>
            {text && (
              <Text className="-mt-1 text-center text-sm font-bold text-white/85">{text}</Text>
            )}
          </BlurView>
        </View>
      </Animated.View>
    </Portal>
  );
};
