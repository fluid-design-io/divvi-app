import { useInfiniteQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react-native';
import React, { useRef } from 'react';
import type { RefObject } from 'react';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { ErrorView } from '~/components/core/error-view';
import Loading from '~/components/core/loading';
import { Button } from '~/components/nativewindui/Button';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import type { LargeTitleSearchBarRef } from '~/components/nativewindui/LargeTitleHeader/types';
import {
  List,
  ListRenderItemInfo,
  ListSectionHeader,
  ListItemProps,
  itemVariants,
} from '~/components/nativewindui/List';
import { Text, TextClassContext } from '~/components/nativewindui/Text';
import AccountButton from '~/components/user/account-button';
import { cn } from '~/lib/cn';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate, GroupListItem } from '~/utils/categorizeGroups';

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
function renderItem(info: ListRenderItemInfo<GroupListItem>) {
  return <Item info={info} />;
}

// The actual ListItem (row) component.
function Item({ info }: { info: ListRenderItemInfo<GroupListItem> }) {
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
        <View className="flex-1 items-end justify-between gap-0.5 px-2">
          <Text className="text-muted-foreground">
            {info.item.memberCount + ` member${info.item.memberCount === 1 ? '' : 's'}`}
          </Text>
          <Text className="font-rounded text-muted-foreground">
            {info.item.totalBalance.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 2,
              minimumFractionDigits: 0,
            })}
          </Text>
        </View>
      }
      disabled={info.item.disabled}
      onPress={info.item.onPress}
    />
  );
}

const ListItem = React.forwardRef(ListItemComponent) as <T extends GroupListItem>(
  props: ListItemProps<T> & { ref?: React.Ref<View> }
) => React.ReactElement;

function ListItemComponent<T extends GroupListItem>(
  {
    item,
    isFirstInSection,
    isLastInSection,
    index,
    variant,
    className,
    androidRootClassName,
    titleClassName,
    titleStyle,
    textNumberOfLines,
    subTitleStyle,
    subTitleClassName,
    subTitleNumberOfLines,
    tertiaryTextStyle,
    tertiaryTextClassName,
    tertiaryTextNumberOfLines,
    textContentClassName,
    sectionHeaderAsGap,
    removeSeparator = false,
    leftView,
    rightView,
    disabled,
    ...props
  }: ListItemProps<T>,
  ref: React.Ref<View>
) {
  if (typeof item === 'string') {
    console.log(
      'List.tsx',
      'ListItemComponent',
      "Invalid item of type 'string' was provided. Use ListSectionHeader instead."
    );
    return null;
  }
  return (
    <>
      <Button
        disabled={disabled}
        variant="plain"
        size="none"
        unstable_pressDelay={100}
        androidRootClassName={androidRootClassName}
        className={itemVariants({
          variant,
          sectionHeaderAsGap,
          isFirstInSection,
          isLastInSection,
          disabled,
          className,
          removeSeparator,
        })}
        {...props}
        ref={ref}>
        <TextClassContext.Provider value="font-normal leading-5">
          {!!leftView && <View>{leftView}</View>}
          <View
            className={cn(
              'h-full flex-1 flex-row',
              !item.subTitle ? 'ios:py-3 py-[18px]' : 'ios:py-2 py-2',
              !leftView && 'ml-4',
              !rightView && 'pr-4',
              !removeSeparator &&
                (!isLastInSection || variant === 'full-width') &&
                'ios:border-b ios:border-border/80',
              !removeSeparator &&
                isFirstInSection &&
                variant === 'full-width' &&
                'ios:border-t ios:border-border/80'
            )}>
            <View className={cn('flex-1', textContentClassName)}>
              <Text numberOfLines={textNumberOfLines} style={titleStyle} className={titleClassName}>
                {item.title}
              </Text>
              {!!item.subTitle && (
                <Text
                  numberOfLines={subTitleNumberOfLines}
                  variant="subhead"
                  style={subTitleStyle}
                  className={cn('text-muted-foreground', subTitleClassName)}>
                  {item.subTitle}
                </Text>
              )}
              {!!item.tertiaryText && (
                <Text
                  numberOfLines={tertiaryTextNumberOfLines}
                  style={tertiaryTextStyle}
                  className={cn('text-xs text-muted-foreground', tertiaryTextClassName)}>
                  {item.tertiaryText}
                </Text>
              )}
            </View>
            {!!rightView && <View>{rightView}</View>}
          </View>
        </TextClassContext.Provider>
      </Button>
      {!removeSeparator && Platform.OS !== 'ios' && !isLastInSection && (
        <View className={cn(variant === 'insets' && 'px-4')}>
          <View className="bg-border/25 dark:bg-border/80 h-px" />
        </View>
      )}
    </>
  );
}
