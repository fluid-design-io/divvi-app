import { Icon, IconProps } from '@roninoss/icons';
import { View, Dimensions } from 'react-native';

// Assuming you have these components or similar ones
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

type EmptyViewProps = {
  title: string;
  description: string;
  icon: IconProps<'material' | 'sfSymbol'>;
  /**
   * The height offset of the empty view.
   *
   * @default 300
   */
  heightOffset?: number;
};

export function EmptyView({ heightOffset = 300, icon, title, description }: EmptyViewProps) {
  const { colors } = useColorScheme();
  return (
    <View
      className="flex-1 items-center justify-center px-10"
      style={{
        minHeight: Dimensions.get('window').height - heightOffset,
      }}>
      <Icon size={48} color={colors.grey2} {...icon} />
      <Text variant="title3" className="mt-2 text-center font-bold">
        {title}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">{description}</Text>
    </View>
  );
}
