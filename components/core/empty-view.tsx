import { Icon, IconProps } from '@roninoss/icons';
import { View, Dimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

// Assuming you have these components or similar ones
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type EmptyViewProps = {
  title: string;
  description: string;
  icon: IconProps<'material' | 'sfSymbol'>;
  /**
   * Whether the empty view is in a bottom tab.
   * If true, the empty view will be smaller.
   */
  bottomTab?: boolean;
  /**
   * Minimum height of the header.
   *
   * Sometimes the searchBar will cause a layout shift, this prop will
   * allow you to add minimum height to the header height calculation to prevent this.
   *
   * @example 150 (headerbar + searchbar)
   *
   * @default 0
   */
  minHeaderHeight?: number;
};

export function EmptyView({ bottomTab = false, minHeaderHeight = 0, ...props }: EmptyViewProps) {
  if (bottomTab) {
    return <WithBottomTab {...props} />;
  }
  return <WithoutBottomTab {...props} />;
}

const WithBottomTab = ({ minHeaderHeight = 0, ...props }: EmptyViewProps) => {
  const headerHeight = useHeaderHeight();
  const bottomTabHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  return (
    <EmptyViewContent
      minHeight={
        Dimensions.get('window').height -
        Math.max(headerHeight, minHeaderHeight) -
        bottomTabHeight -
        insets.bottom
      }
      {...props}
    />
  );
};

const WithoutBottomTab = ({ minHeaderHeight = 0, ...props }: EmptyViewProps) => {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  return (
    <EmptyViewContent
      minHeight={
        Dimensions.get('window').height -
        Math.max(headerHeight, minHeaderHeight) -
        insets.bottom -
        insets.top
      }
      {...props}
    />
  );
};

const EmptyViewContent = ({
  minHeight,
  title,
  description,
  icon,
}: EmptyViewProps & { minHeight: number }) => {
  const { colors } = useColorScheme();
  return (
    <View
      className="flex-1 items-center justify-center px-10"
      style={{
        minHeight,
      }}>
      <Icon size={48} color={colors.grey2} {...icon} />
      <Text variant="title3" className="mt-2 text-center font-bold">
        {title}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">{description}</Text>
    </View>
  );
};
