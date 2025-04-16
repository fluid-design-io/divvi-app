import React from 'react';
import { Platform, View } from 'react-native';

import { Button } from '~/components/nativewindui/Button';
import { ListItemProps, itemVariants } from '~/components/nativewindui/List';
import { Text, TextClassContext } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';
import { GroupListItem } from '~/utils/categorizeGroups';

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

export default ListItem;
