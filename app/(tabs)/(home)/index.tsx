import { Icon } from '@roninoss/icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react-native';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import type { LargeTitleSearchBarRef } from '~/components/nativewindui/LargeTitleHeader/types';
import {
  List,
  ListItem,
  ListRenderItemInfo,
  ListSectionHeader,
  ExtendedListDataItem,
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import AccountButton from '~/components/user/account-button';
import { useColorScheme } from '~/lib/useColorScheme';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate } from '~/utils/categorizeGroups';

// Main component name placeholder
export default function GroupList() {
  const searchBarRef = useRef<LargeTitleSearchBarRef | null>(null);

  const { data, isPending, isRefetching, error, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery(
      trpc.group.all.infiniteQueryOptions(
        {
          limit: 5,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.nextCursor;
          },
        }
      )
    );

  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  // Use the categorization function
  const DATA = categorizeGroupsByDate(data);

  return (
    <>
      <LargeTitleHeader
        title="Divvi"
        rightView={() => <AccountButton />}
        searchBar={{
          ref: searchBarRef as RefObject<LargeTitleSearchBarRef>,
          onChangeText: (text) => {
            console.log(text);
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
        sectionHeaderAsGap={false}
        ListEmptyComponent={isPending ? <Loading /> : <ListEmpty />}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentInsetAdjustmentBehavior="automatic"
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
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

  console.log(info);
  // If it's a string, treat it as a section header
  if (typeof info.item === 'string') {
    return (
      <ListSectionHeader
        {...info}
        className="ios:pb-2 pl-0"
        textVariant="title3"
        textClassName="text-foreground font-semibold"
      />
    );
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
