'use client';

import { forwardRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

import { useBottomTabOverflow } from './tab-bar-background';

export const BodyScrollView = forwardRef<any, ScrollViewProps>((props, ref) => {
  const paddingBottom = useBottomTabOverflow();
  return (
    <ScrollView
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{ bottom: paddingBottom }}
      scrollIndicatorInsets={{ bottom: paddingBottom }}
      showsVerticalScrollIndicator={false}
      {...props}
      ref={ref}
    />
  );
});

BodyScrollView.displayName = 'BodyScrollView';
