import { LucideIcon, LucideProps } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { cn } from '~/lib/cn';

interface IconProps {
  Icon: LucideIcon | React.FC<LucideProps>;
  iconClassName?: string;
}

export function TonalIcon({ Icon, iconClassName }: IconProps) {
  return (
    <View className="bg-primary/15 overflow-hidden rounded-full p-6">
      <Icon className={cn('h-16 w-16 text-primary', iconClassName)} />
    </View>
  );
}
