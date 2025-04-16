import React, { forwardRef } from 'react';
import { View, ViewProps, Pressable } from 'react-native';

import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';

type BorderCardProps = ViewProps & {
  onPress?: () => void;
};

const BorderCard = forwardRef<View, BorderCardProps>(({ className, onPress, ...props }, ref) => {
  const Component = onPress ? Pressable : View;
  return (
    <Component
      ref={ref}
      onPress={onPress}
      className={cn(
        'mx-auto w-full max-w-md gap-2 border-y-hairline border-border bg-card px-4 py-6',
        'web:rounded-2xl web:border-x-hairline',
        className
      )}
      {...props}
    />
  );
});

BorderCard.displayName = 'BorderCard';

const BorderCardHeader = ({
  title,
  rightView,
  children,
  titleClassName,
  ...props
}: ViewProps & { title: string; rightView?: React.ReactNode; titleClassName?: string }) => {
  return (
    <View {...props}>
      <View className="flex-row items-center justify-between">
        <Text variant="title2" className={cn('font-semibold', titleClassName)}>
          {title}
        </Text>
        {rightView && <View>{rightView}</View>}
      </View>
      {children}
    </View>
  );
};

export { BorderCard, BorderCardHeader };
