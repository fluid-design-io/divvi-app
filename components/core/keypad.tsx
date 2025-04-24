import { Icon } from '@roninoss/icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Button } from '../nativewindui/Button';
import { Card } from '../nativewindui/Card';
import { Text } from '../nativewindui/Text';

import { useHaptic } from '~/hooks/use-haptic';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { useIsCompactDevice } from '~/hooks/use-is-compact-device';

export const KEYPAD_NUMBERS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['00', '0', 'backspace'],
] as const;

interface NumericKeypadProps {
  onNumberPress: (num: string) => void;
  onLongPress?: (num: string) => void;
  keypadClassName?: string;
  buttonClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  /**
   * If false, the keypad will be disabled and the user will not be able to input numbers.
   */
  editable?: boolean;
}

// TODO: Element.Ref warning
const AnimatedButton = Animated.createAnimatedComponent(Button);

export function NumericKeypad({
  onNumberPress,
  onLongPress,
  editable = true,
  keypadClassName = 'gap-1',
  buttonClassName = 'h-14 rounded-full',
  buttonSize = Platform.select({ ios: 'lg', default: 'md' }),
}: NumericKeypadProps) {
  const hapticSoft = useHaptic('light');
  const { colors } = useColorScheme();
  const isCompact = useIsCompactDevice();

  return (
    <Card className={cn(isCompact ? 'p-2' : 'p-4', keypadClassName)}>
      {!editable && (
        <BlurView
          intensity={10}
          tint="systemThinMaterialLight"
          className="bg-card/70 z-10 items-center justify-center"
          style={StyleSheet.absoluteFill}>
          <Text variant="subhead" className="text-muted-foreground">
            Editing disabled
          </Text>
        </BlurView>
      )}
      {KEYPAD_NUMBERS.map((row, i) => (
        <View key={i} className="flex-row justify-around gap-1">
          {row.map((num) => (
            <View className="flex-1" key={num}>
              <BounceButton
                variant="muted"
                size={buttonSize}
                className={cn(buttonClassName, isCompact && 'h-11')}
                onPress={() => onNumberPress(num)}
                onLongPress={() => {
                  onLongPress?.(num);
                  hapticSoft();
                }}
                onPressHaptic={hapticSoft}>
                {num === 'backspace' ? (
                  <Icon name="keyboard-backspace" size={24} color={colors.foreground} />
                ) : (
                  <Text className="text-xl tabular-nums">{num}</Text>
                )}
              </BounceButton>
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
}

interface BounceButtonProps extends React.ComponentProps<typeof Button> {
  onPressHaptic?: () => void;
}

export function BounceButton({ onPressHaptic, onPress, ...props }: BounceButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedButton
      {...props}
      style={[animatedStyle, props.style]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { stiffness: 1000, damping: 10 });
        onPressHaptic?.();
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    />
  );
}

const QUICK_AMOUNTS = ['$10', '$25', '$50', '$100', '$200'] as const;

interface FixedAmountKeypadProps {
  onAmountPress: (amount: number) => void;
  onSwitchToNumeric: () => void;
  keypadClassName?: string;
  buttonClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function FixedAmountKeypad({
  onAmountPress,
  onSwitchToNumeric,
  editable = true,
  keypadClassName = 'gap-1',
  buttonClassName = 'h-14 rounded-full',
  buttonSize = Platform.select({ ios: 'lg', default: 'md' }),
}: FixedAmountKeypadProps) {
  const hapticSoft = useHaptic('light');
  const { colors } = useColorScheme();

  const handleAmountPress = (amountStr: string) => {
    const amount = parseInt(amountStr.replace('$', ''), 10) * 100;
    onAmountPress(amount);
  };

  return (
    <Card className={cn('p-4', keypadClassName)}>
      {!editable && (
        <BlurView
          intensity={10}
          tint="systemThinMaterialLight"
          className="bg-card/70 z-10 items-center justify-center"
          style={StyleSheet.absoluteFill}>
          <Text variant="subhead" className="text-muted-foreground">
            Editing disabled
          </Text>
        </BlurView>
      )}
      <View className="flex-row flex-wrap justify-around gap-1">
        {QUICK_AMOUNTS.map((amount) => (
          <View className="mb-1 w-[30%]" key={amount}>
            <BounceButton
              variant="muted"
              size={buttonSize}
              className={buttonClassName}
              onPress={() => handleAmountPress(amount)}
              onPressHaptic={hapticSoft}>
              <Text className="text-xl tabular-nums">{amount}</Text>
            </BounceButton>
          </View>
        ))}
        <View className="mb-1 w-[30%]">
          <BounceButton
            variant="muted"
            size={buttonSize}
            className={buttonClassName}
            onPress={onSwitchToNumeric}
            onPressHaptic={hapticSoft}>
            <Icon name="dots-horizontal" size={24} color={colors.foreground} />
          </BounceButton>
        </View>
      </View>
    </Card>
  );
}

interface QuickActionKeypadProps extends NumericKeypadProps {
  initialMode?: 'fixed' | 'numeric';
  onSwitchToNumeric?: () => void;
  onQuickAmountPress?: (amount: string) => void;
}

export function QuickActionKeypad({
  onNumberPress,
  initialMode = 'fixed',
  onSwitchToNumeric,
  onQuickAmountPress,
  ...numericKeypadProps
}: QuickActionKeypadProps) {
  const [mode, setMode] = useState<'fixed' | 'numeric'>(initialMode);

  const handleNumberPress = (num: string) => {
    onNumberPress(num);
  };

  const handleFixedAmountPress = (amount: number) => {
    onNumberPress('reset:' + amount.toString()); // reset:1000 to ignore previous amount
    onQuickAmountPress?.(amount.toString());
  };

  const handleSwitchToNumeric = () => {
    setMode('numeric');
    onSwitchToNumeric?.();
  };

  if (mode === 'numeric') {
    return <NumericKeypad {...numericKeypadProps} onNumberPress={handleNumberPress} />;
  }

  return (
    <FixedAmountKeypad
      {...numericKeypadProps}
      onAmountPress={handleFixedAmountPress}
      onSwitchToNumeric={handleSwitchToNumeric}
    />
  );
}
