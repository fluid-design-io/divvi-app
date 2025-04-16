import { VariantProps, cva } from 'class-variance-authority';
import { AlertCircle, RefreshCcw } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { Button } from '../nativewindui/Button';
import { Text } from '../nativewindui/Text';

import { cn } from '~/lib/cn';

const errorViewVariants = cva('items-center justify-center', {
  variants: {
    variant: {
      plain: 'bg-transparent p-1',
      default: 'bg-card rounded-2xl p-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ErrorViewProps = {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  rootClassName?: string;
  containerClassName?: string;
  textContainerClassName?: string;
} & VariantProps<typeof errorViewVariants>;

export function ErrorView({
  message,
  onRetry,
  retryText = 'Try Again',
  rootClassName,
  containerClassName,
  textContainerClassName,
  variant,
}: ErrorViewProps) {
  return (
    <View className={cn('w-full items-center justify-center', rootClassName)}>
      <View className={cn(errorViewVariants({ variant }), containerClassName)}>
        <AlertCircle
          size={48}
          className={cn('text-destructive', variant === 'default' && 'mb-4')}
        />
        <Button variant="plain" onPress={onRetry}>
          <RefreshCcw size={20} className="mr-1 text-primary" />
          <Text className="font-medium text-primary">{retryText}</Text>
        </Button>
      </View>
      <ScrollView
        contentContainerClassName={cn(
          'flex-row items-center',
          variant === 'default' && 'mt-4',
          textContainerClassName
        )}>
        <Text className="text-foreground/60">{message || 'Something went wrong'}</Text>
      </ScrollView>
    </View>
  );
}
