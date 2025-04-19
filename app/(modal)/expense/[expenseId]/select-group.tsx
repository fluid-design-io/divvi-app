import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Loading from '~/components/core/loading';
import { List } from '~/components/nativewindui/List';
import { renderItem } from '~/components/screen/group';
import { trpc } from '~/utils/api';
import { categorizeGroupsByDate } from '~/utils/categorize-groups';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '~/components/nativewindui/Button';
import { Icon } from '@roninoss/icons';
import { useColorScheme } from '~/lib/useColorScheme';
import { authClient } from '~/lib/auth/client';
import { EmptyView } from '~/components/core/empty-view';

export default function SelectGroup() {
  const [searchTerm, setSearchTerm] = useState('');
  const { colors } = useColorScheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { data, isPending, isRefetching, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    trpc.group.all.infiniteQueryOptions(
      {
        searchTerm,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  if (isSessionPending) return <Loading expand />;

  const DATA = categorizeGroupsByDate(data, {
    onPress: (groupId) => {
      router.back();
      router.setParams({ groupId });
    },
    userId: session?.user.id ?? '',
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select Group',
          headerTitle: 'Select Group',
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
        ListEmptyComponent={
          isPending ? (
            <Loading />
          ) : (
            <EmptyView
              title="No Groups"
              description="Click on the '+' button to create a new group"
              icon={{ name: 'info.circle', ios: { name: 'rectangle.stack' } }}
              minHeaderHeight={150}
            />
          )
        }
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
