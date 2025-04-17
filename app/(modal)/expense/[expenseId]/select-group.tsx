import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Loading from '~/components/core/loading';
import { List } from '~/components/nativewindui/List';
import { ListEmpty, renderItem } from '~/components/screen/group';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate } from '~/utils/categorize-groups';
import { router, Stack } from 'expo-router';
import { useSetAtom } from 'jotai';
import { selectedGrouIdAtom } from '.';
// Main component name placeholder
export default function SelectGroup() {
  const [searchTerm, setSearchTerm] = useState('');
  const setSelectedGroupId = useSetAtom(selectedGrouIdAtom);

  const { data, isPending, isRefetching, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    trpc.group.all.infiniteQueryOptions(
      {
        limit: 5,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  const DATA = categorizeGroupsByDate(data, {
    onPress: (groupId) => {
      setSelectedGroupId(groupId);
      router.back();
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
