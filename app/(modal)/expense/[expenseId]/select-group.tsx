import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Loading from '~/components/core/loading';
import { List } from '~/components/nativewindui/List';
import { ListEmpty, renderItem } from '~/components/screen/group';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate } from '~/utils/categorize-groups';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '~/components/nativewindui/Button';
import { Icon } from '@roninoss/icons';
import { useColorScheme } from '~/lib/useColorScheme';

export default function SelectGroup() {
  const [searchTerm, setSearchTerm] = useState('');
  const { colors } = useColorScheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { data, isPending, isRefetching, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    trpc.group.all.infiniteQueryOptions(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  const DATA = categorizeGroupsByDate(data, {
    onPress: (groupId) => {
      router.back();
      router.setParams({ groupId });
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select Group',
          headerShown: true,
          animation: 'default',
          headerSearchBarOptions: {
            placeholder: 'Search',
          },
          headerRight: () => (
            <Button variant="plain" size="none" onPress={() => router.push('/(modal)/group/new')}>
              <Icon name="plus" size={24} color={colors.primary} />
            </Button>
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
