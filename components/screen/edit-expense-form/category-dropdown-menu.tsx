import { DropdownMenu } from '~/components/nativewindui/DropdownMenu';
import { CATEGORIES } from './constants';
import { createDropdownItem } from '~/components/nativewindui/DropdownMenu/utils';
import { capitalize } from '~/utils/format';
import { Icon, SfSymbolIconName } from '@roninoss/icons';
import type { Category } from '~/server/api/schema';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([category, { ios }]) =>
  createDropdownItem({
    actionKey: category,
    title: capitalize(category),
    icon: {
      namingScheme: 'sfSymbol',
      name: ios.name as SfSymbolIconName,
    },
  })
);

export const CategoryDropdownMenu = ({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}) => {
  const { colors } = useColorScheme();
  return (
    <DropdownMenu
      items={CATEGORY_OPTIONS}
      onItemPress={(item) => {
        onSelectCategory(item.actionKey as Category);
      }}>
      <Button variant="tonal" size="sm">
        <Text>{capitalize(selectedCategory ?? 'Select Category...')}</Text>
        <Icon
          ios={{
            name: CATEGORIES[selectedCategory].ios.name as SfSymbolIconName,
          }}
          name="information"
          size={16}
          color={colors.primary}
        />
      </Button>
    </DropdownMenu>
  );
};
