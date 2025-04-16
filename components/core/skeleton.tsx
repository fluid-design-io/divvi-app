import * as React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '~/lib/cn';

const duration = 1000;

function Skeleton({
  animation = true,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Animated.View> & {
  animation?: boolean;
}) {
  const sv = useSharedValue(1);

  React.useEffect(() => {
    if (animation) {
      sv.value = withRepeat(
        withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })),
        -1
      );
    }
  }, [animation]);

  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
  }));

  return (
    <Animated.View
      style={[style, props.style]}
      className={cn(
        'bg-muted/30 dark:bg-muted-foreground/20 dark:ios:bg-muted rounded-md',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
