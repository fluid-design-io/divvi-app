import { Info, LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnlyNative, OnlyWeb } from './platform-specific';

import { TonalIcon } from '~/components/core/icon';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

interface FormScrollViewProps extends KeyboardAwareScrollViewProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
  buttonText?: string;
  buttonDisabled?: boolean;
  onSubmit?: () => void;
  Icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  /**
   * The offset of the footer when the keyboard is open.
   *
   * @default 0
   */
  footerBottomOffset?: number;
}

export const FormScrollView = ({
  children,
  title,
  subtitle,
  footer,
  buttonText = 'Continue',
  buttonDisabled = false,
  onSubmit,
  Icon = Info,
  contentContainerClassName,
  footerBottomOffset = 0,
  ...props
}: FormScrollViewProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();

  const footerBody = footer ? (
    footer
  ) : (
    <View
      className={Platform.select({
        default: 'flex-row justify-end px-4 py-4',
        web: 'flex-row justify-end pt-6',
        ios: 'px-10 py-4',
      })}>
      <Button
        onPress={() => onSubmit?.()}
        size={Platform.OS === 'ios' ? 'lg' : 'md'}
        disabled={buttonDisabled}>
        <Text>{buttonText}</Text>
      </Button>
    </View>
  );

  return (
    <View className="flex-1">
      <KeyboardAwareScrollView
        bottomOffset={Platform.select({ ios: 96, android: 84 })}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName={cn('px-4 web:p-0', contentContainerClassName)}
        {...props}>
        <View className={cn('mx-auto w-full max-w-lg', 'web:rounded-2xl web:bg-card web:p-6')}>
          <View className="items-center justify-center">
            <TonalIcon Icon={Icon} />
          </View>
          {title && <FormTitle title={title} subtitle={subtitle} />}
          {children && children}
          <OnlyWeb>{footerBody}</OnlyWeb>
        </View>
      </KeyboardAwareScrollView>

      <OnlyNative>
        <KeyboardStickyView
          offset={{ closed: -footerBottomOffset, opened: insets.bottom - footerBottomOffset }}
          style={{
            backgroundColor: colors.background,
          }}>
          {footerBody}
        </KeyboardStickyView>
      </OnlyNative>
    </View>
  );
};

export const FormTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <View className="mb-6 gap-2">
      <Text variant="title1" className="ios:font-bold pt-4 text-center">
        {title}
      </Text>
      {subtitle && (
        <Text variant="body" className="text-center text-muted-foreground">
          {subtitle}
        </Text>
      )}
    </View>
  );
};
