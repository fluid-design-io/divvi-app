import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';

/**
 * iOS only, default to `w-32`
 */
export function LeftLabel({ label, className }: { label: string; className?: string }) {
  return (
    <View className={cn('w-32 justify-center pl-2', className)}>
      <Text className="font-medium">{label}</Text>
    </View>
  );
}

LeftLabel.displayName = 'LeftLabel';
