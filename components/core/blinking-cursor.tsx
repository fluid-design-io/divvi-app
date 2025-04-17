import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface BlinkingCursorProps {
  className?: string;
  duration?: number;
}

export function BlinkingCursor({
  className = 'mb-3 ml-1 h-10 w-[2px] rounded-full bg-foreground/50',
  duration = 600,
}: BlinkingCursorProps) {
  const caretOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(caretOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(caretOpacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ])
    );

    blinkAnimation.start();

    return () => blinkAnimation.stop();
  }, [duration]);

  return <Animated.View className={className} style={{ opacity: caretOpacity }} />;
}
