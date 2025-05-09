import * as Slot from '@rn-primitives/slot';
import { BlurView } from 'expo-blur';
import { Image, ImageProps } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { Platform, StyleSheet, View, ColorValue } from 'react-native';

import { Text, TextClassContext } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

cssInterop(BlurView, {
  className: 'style',
});
cssInterop(LinearGradient, {
  className: 'style',
});

interface CardProps extends React.ComponentPropsWithoutRef<typeof View> {
  rootClassName?: string;
}

const Card = ({ className, rootClassName, ...props }: CardProps) => (
  <View
    className={cn(
      'ios:shadow ios:rounded-2xl rounded-xl bg-card shadow-lg shadow-black/10',
      rootClassName
    )}>
    <View
      className={cn('ios:rounded-2xl justify-end overflow-hidden rounded-xl', className)}
      {...props}
    />
  </View>
);
Card.displayName = 'Card';

interface CardBadgeProps extends React.ComponentPropsWithoutRef<typeof View> {}

const CardBadge = ({ className, style, ...props }: CardBadgeProps) => {
  const { colors } = useColorScheme();
  return (
    <TextClassContext.Provider value="text-xs font-medium tracking-widest ios:uppercase">
      <View
        className={cn(
          'android:right-2 android:top-2.5 android:rounded-full android:border android:border-border ios:left-0 ios:rounded-br-2xl absolute top-0 z-50 px-3 py-1 pl-2',
          className
        )}
        style={style ?? { backgroundColor: colors.card }}
        {...props}
      />
    </TextClassContext.Provider>
  );
};
CardBadge.displayName = 'CardBadge';

interface CardContentProps extends React.ComponentPropsWithoutRef<typeof View> {
  linearGradientColors?: [ColorValue, ColorValue, ...ColorValue[]];
  iosBlurIntensity?: number;
  iosBlurClassName?: string;
}

const CardContent = ({
  className,
  linearGradientColors,
  iosBlurIntensity = 3,
  iosBlurClassName,
  ...props
}: CardContentProps) => {
  if (linearGradientColors) {
    return (
      <LinearGradient colors={linearGradientColors} className="pt-4">
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={iosBlurIntensity}
            className={cn('absolute bottom-0 left-0 right-0 top-1/2', iosBlurClassName)}
          />
        )}
        <View className={cn('ios:px-5 space-y-1.5 px-4 pb-4', className)} {...props} />
      </LinearGradient>
    );
  }
  return (
    <>
      {Platform.OS === 'ios' && (
        <BlurView intensity={iosBlurIntensity} className={iosBlurClassName} />
      )}
      <View className={cn('ios:px-5 space-y-1.5 px-4 py-4', className)} {...props} />
    </>
  );
};
CardContent.displayName = 'CardContent';

interface CardImageProps extends Omit<ImageProps, 'className'> {
  materialRootClassName?: string;
}

const CardImage = ({
  transition = 200,
  style = StyleSheet.absoluteFill,
  contentPosition = 'top right',
  contentFit = 'cover',
  materialRootClassName,
  ...props
}: CardImageProps) => {
  const Root = Platform.OS === 'ios' ? Slot.Image : View;
  return (
    <Root
      className={Platform.select({
        ios: undefined,
        default: cn('relative flex-1 overflow-hidden rounded-2xl', materialRootClassName),
      })}>
      <Image
        transition={transition}
        style={style}
        contentPosition={contentPosition}
        contentFit={contentFit}
        {...props}
      />
    </Root>
  );
};
CardImage.displayName = 'CardImage';

function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn(
        'ios:font-bold text-3xl font-medium leading-none tracking-tight text-card-foreground',
        className
      )}
      {...props}
    />
  );
}

function CardSubtitle({
  className,
  variant = Platform.select({ ios: 'footnote' }),
  ...props
}: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text
      variant={variant}
      className={cn('ios:font-bold ios:uppercase font-medium opacity-70', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return <Text className={cn('leading-5 text-muted-foreground', className)} {...props} />;
}

const CardFooter = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof BlurView>) => (
  <BlurView
    intensity={Platform.select({ ios: 15, default: 0 })}
    className={cn('ios:px-5 ios:pt-3 flex-row items-center gap-4 px-4 pb-4 pt-0', className)}
    {...props}
  />
);
CardFooter.displayName = 'CardFooter';

function addOpacityToRgb(rgb: string, opacity: number): string {
  // Validate the RGB input
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const match = rgb.match(rgbRegex);

  if (!match) {
    throw new Error('Invalid RGB color format. Expected format: rgb(255, 255, 255)');
  }

  // Extract the RGB values
  const [r, g, b] = match.slice(1, 4).map(Number);

  // Validate the RGB values
  if ([r, g, b].some((value) => value < 0 || value > 255)) {
    throw new Error('RGB values must be between 0 and 255.');
  }

  // Validate the opacity value
  if (opacity < 0 || opacity > 1) {
    throw new Error('Opacity must be a value between 0 and 1.');
  }

  // Convert the RGB values to an RGBA string with the specified opacity
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export {
  addOpacityToRgb,
  Card,
  CardBadge,
  CardContent,
  CardDescription,
  CardFooter,
  CardImage,
  CardSubtitle,
  CardTitle,
};
