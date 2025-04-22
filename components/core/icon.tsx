import { Icon as NativeIcon, IconProps as NativeIconProps } from '@roninoss/icons';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

interface IconProps {
  Icon: LucideIcon | React.FC<LucideProps>;
  iconClassName?: string;
}

export function TonalIcon({ Icon, iconClassName }: IconProps) {
  const { colors } = useColorScheme();
  return (
    <View className="bg-primary/15 overflow-hidden rounded-full p-6">
      <Icon className={cn('h-16 w-16', iconClassName)} color={colors.primary} />
    </View>
  );
}

export function TonalIconNative({ icon }: { icon: NativeIconProps<'material' | 'sfSymbol'> }) {
  const { colors } = useColorScheme();
  return (
    <View className="bg-primary/15 overflow-hidden rounded-full p-6">
      <NativeIcon {...icon} color={colors.primary} />
    </View>
  );
}
