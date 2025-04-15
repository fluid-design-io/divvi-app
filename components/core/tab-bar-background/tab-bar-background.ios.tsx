import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurTint, BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BlurTabBarBackground({
  tint = 'systemChromeMaterial',
  intensity = 100,
}: {
  tint?: BlurTint
  intensity?: number;
}) {
  return (
    <BlurView
      tint={tint}
      intensity={intensity}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  let tabHeight = 0;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tabHeight = useBottomTabBarHeight();
  } catch { }
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
