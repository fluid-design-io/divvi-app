import { Icon } from '@roninoss/icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useRef } from 'react';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, ZoomOut } from 'react-native-reanimated';

import { ErrorView } from '~/components/core/error-view'; //! remove or rename if you don't have ErrorView
import Loading from '~/components/core/loading';
import { Button } from '~/components/nativewindui/Button';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import { LargeTitleSearchBarRef } from '~/components/nativewindui/LargeTitleHeader/types';
import {
  List,
  ListItem,
  ListRenderItemInfo,
  ListSectionHeader,
  ExtendedListDataItem,
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { trpc } from '~/utils/api';
// Main component name placeholder
export default function GroupList() {
  //! Example: Extract route params if needed
  const { colors } = useColorScheme();
  const searchBarRef = useRef<LargeTitleSearchBarRef | null>(null);

  //! Replace with dynamic useQuery or other data fetching logic
  const { data, isPending, isRefetching, error, isError, refetch } = useQuery(
    trpc.group.all.queryOptions()
  );

  //! optional: handle error state
  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  // Map the data to the shape needed for the List
  const DATA: ExtendedListDataItem[] =
    data?.map((item) => ({
      id: item.id,
      title: item.name || 'Title',
      subTitle: item.description || '',
      value: item.updatedAt.toLocaleDateString() || '',
      onPress: () => {
        // Example navigation using expo-router
        router.push(`/group/${item.id}`);
      },
    })) || [];

  return (
    <>
      <LargeTitleHeader
        title="Divvi"
        rightView={() => (
          <Button variant="plain" size="icon">
            <Icon size={24} name="account-circle-outline" color={colors.foreground} />
          </Button>
        )}
        searchBar={{
          ref: searchBarRef,
          onChangeText: (text) => {
            console.log(text);
          },
          materialRightView() {
            return (
              <Animated.View entering={FadeIn} exiting={ZoomOut}>
                <Button variant="plain" size="icon">
                  <Icon size={24} name="cog-outline" color={colors.foreground} />
                </Button>
              </Animated.View>
            );
          },
          content: (
            <KeyboardAwareScrollView
              className="ios:bg-background/95"
              contentContainerClassName="flex-1"
              keyboardShouldPersistTaps="always">
              <View className="flex-1 items-center justify-center">
                <Text>Search bar content</Text>
              </View>
            </KeyboardAwareScrollView>
          ),
        }}
      />

      <List
        variant="insets"
        data={DATA}
        renderItem={renderItem}
        sectionHeaderAsGap={Platform.OS === 'ios'}
        ListEmptyComponent={isPending ? <Loading /> : <ListEmpty />}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentInsetAdjustmentBehavior="automatic"
      />
    </>
  );
}

// Displayed when the list is empty (e.g., no data).
function ListEmpty() {
  return (
    <View className="flex-1 items-center justify-center">
      <Info className="mb-2 h-6 w-6 text-muted-foreground" />
      <Text className="text-center text-sm text-muted-foreground">No items found</Text>
    </View>
  );
}

// Wrapper to pass the item info to the actual Item component
function renderItem(info: ListRenderItemInfo<ExtendedListDataItem>) {
  return <Item info={info} />;
}

// The actual ListItem (row) component.
function Item({ info }: { info: ListRenderItemInfo<ExtendedListDataItem> }) {
  const { colors } = useColorScheme();
  // If it's a string, treat it as a section header
  if (typeof info.item === 'string') {
    return <ListSectionHeader {...info} />;
  }

  return (
    <ListItem
      {...info}
      target="Cell"
      variant="insets"
      //! optional primary text if onPress is true
      // titleClassName={info.item.onPress && 'ios:text-primary'}
      rightView={
        <View className="flex-1 flex-row items-center gap-0.5 px-2">
          {!!info.item.value && <Text className="text-muted-foreground">{info.item.value}</Text>}
          {info.item.onPress && <Icon name="chevron-right" size={22} color={colors.grey2} />}
        </View>
      }
      disabled={info.item.disabled}
      onPress={info.item.onPress}
    />
  );
}
