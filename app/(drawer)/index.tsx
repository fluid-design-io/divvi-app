import { useActionSheet } from '@expo/react-native-action-sheet';
import { LegendList } from '@legendapp/list';
import { useHeaderHeight } from '@react-navigation/elements';
import { Icon } from '@roninoss/icons';
import { Stack } from 'expo-router';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import {
  Button as RNButton,
  ButtonProps,
  Linking,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Slider } from '~/components/nativewindui/Slider';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { useHeaderSearchBar } from '~/lib/useHeaderSearchBar';

export default function Home() {
  const searchValue = useHeaderSearchBar({ hideWhenScrolling: COMPONENTS.length === 0 });

  const data = searchValue
    ? COMPONENTS.filter((c) => c.name.toLowerCase().includes(searchValue.toLowerCase()))
    : COMPONENTS;

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />

      <LegendList
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        data={data}
        estimatedItemSize={200}
        contentContainerClassName="py-4 android:pb-12"
        extraData={searchValue}
        removeClippedSubviews={false} // used for selecting text on android
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderItemSeparator}
        renderItem={renderItem}
        ListEmptyComponent={COMPONENTS.length === 0 ? ListEmptyComponent : undefined}
        recycleItems
      />

    </>
  );
}

cssInterop(LegendList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

function DefaultButton({ color, ...props }: ButtonProps) {
  const { colors } = useColorScheme();
  return <RNButton color={color ?? colors.primary} {...props} />;
}

function ListEmptyComponent() {
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const { colors } = useColorScheme();
  const height = dimensions.height - headerHeight - insets.bottom - insets.top;

  return (
    <View style={{ height }} className="flex-1 items-center justify-center gap-1 px-12">
      <Icon name="file-plus-outline" size={42} color={colors.grey} />
      <Text variant="title3" className="pb-1 text-center font-semibold">
        No Components Installed
      </Text>
      <Text color="tertiary" variant="subhead" className="pb-4 text-center">
        You can install any of the free components from the{' '}
        <Text
          onPress={() => Linking.openURL('https://nativewindui.com')}
          variant="subhead"
          className="text-primary">
          NativeWindUI
        </Text>
        {' website.'}
      </Text>
    </View>
  );
}

type ComponentItem = { name: string; component: React.FC };

function keyExtractor(item: ComponentItem) {
  return item.name;
}

function renderItemSeparator() {
  return <View className="p-2" />;
}

function renderItem({ item }: { item: ComponentItem }) {
  return (
    <Card title={item.name}>
      <item.component />
    </Card>
  );
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View className="px-4">
      <View className="gap-4 rounded-xl border border-border bg-card p-4 pb-6 shadow-sm shadow-black/10 dark:shadow-none">
        <Text className="text-center text-sm font-medium tracking-wider opacity-60">{title}</Text>
        {children}
      </View>
    </View>
  );
}

const COMPONENTS: ComponentItem[] = [
  {
    name: 'Picker',
    component: function PickerExample() {
      const { colors } = useColorScheme();
      const [picker, setPicker] = React.useState('blue');
      return (
        <Picker selectedValue={picker} onValueChange={(itemValue) => setPicker(itemValue)}>
          <PickerItem
            label="Red"
            value="red"
            color={colors.foreground}
            style={{
              backgroundColor: colors.root,
            }}
          />
          <PickerItem
            label="Blue"
            value="blue"
            color={colors.foreground}
            style={{
              backgroundColor: colors.root,
            }}
          />
          <PickerItem
            label="Green"
            value="green"
            color={colors.foreground}
            style={{
              backgroundColor: colors.root,
            }}
          />
        </Picker>
      );
    },
  },

  {
    name: 'Slider',
    component: function SliderExample() {
      const [sliderValue, setSliderValue] = React.useState(0.5);
      return <Slider value={sliderValue} onValueChange={setSliderValue} />;
    },
  },

  {
    name: 'Action Sheet',
    component: function ActionSheetExample() {
      const { colorScheme, colors } = useColorScheme();
      const { showActionSheetWithOptions } = useActionSheet();
      return (
        <View className="items-center">
          <DefaultButton
            color="grey"
            onPress={async () => {
              const options = ['Delete', 'Save', 'Cancel'];
              const destructiveButtonIndex = 0;
              const cancelButtonIndex = 2;

              showActionSheetWithOptions(
                {
                  options,
                  cancelButtonIndex,
                  destructiveButtonIndex,
                  containerStyle: {
                    backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
                  },
                  textStyle: {
                    color: colors.foreground,
                  },
                },
                (selectedIndex) => {
                  switch (selectedIndex) {
                    case 1:
                      // Save
                      break;

                    case destructiveButtonIndex:
                      // Delete
                      break;

                    case cancelButtonIndex:
                    // Canceled
                  }
                }
              );
            }}
            title="Open action sheet"
          />
        </View>
      );
    },
  },

  {
    name: 'Text',
    component: function TextExample() {
      return (
        <View className="gap-2">
          <Text variant="largeTitle" className="text-center">
            Large Title
          </Text>
          <Text variant="title1" className="text-center">
            Title 1
          </Text>
          <Text variant="title2" className="text-center">
            Title 2
          </Text>
          <Text variant="title3" className="text-center">
            Title 3
          </Text>
          <Text variant="heading" className="text-center">
            Heading
          </Text>
          <Text variant="body" className="text-center">
            Body
          </Text>
          <Text variant="callout" className="text-center">
            Callout
          </Text>
          <Text variant="subhead" className="text-center">
            Subhead
          </Text>
          <Text variant="footnote" className="text-center">
            Footnote
          </Text>
          <Text variant="caption1" className="text-center">
            Caption 1
          </Text>
          <Text variant="caption2" className="text-center">
            Caption 2
          </Text>
        </View>
      );
    },
  },
  {
    name: 'Selectable Text',
    component: function SelectableTextExample() {
      return (
        <Text uiTextView selectable>
          Long press or double press this text
        </Text>
      );
    },
  },

  {
    name: 'Bottom Sheet',
    component: function BottomSheetExample() {
      const { colorScheme } = useColorScheme();
      const bottomSheetModalRef = useSheetRef();

      return (
        <View className="items-center">
          <DefaultButton
            color={colorScheme === 'dark' && Platform.OS === 'ios' ? 'white' : 'black'}
            title="Open Bottom Sheet"
            onPress={() => bottomSheetModalRef.current?.present()}
          />
          <Sheet ref={bottomSheetModalRef} snapPoints={[200]}>
            <View className="flex-1 items-center justify-center pb-8">
              <Text>@gorhom/bottom-sheet 🎉</Text>
            </View>
          </Sheet>
        </View>
      );
    },
  },
];
