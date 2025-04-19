import { router, Stack } from 'expo-router';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { useEffect, useState } from 'react';
import { LoadingOverlay } from '~/components/core/loading';
import { authClient } from '~/lib/auth/client';
import { ErrorView } from '~/components/core/error-view';

export default function NewGroup() {
  const queryClient = useQueryClient();
  const { data: session, isPending: isLoadingSession } = authClient.useSession();

  const [mounted, setMounted] = useState(false);
  const { mutate: createGroup, isPending: isCreatingGroup } = useMutation(
    trpc.group.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.all.infiniteQueryKey() });
        await queryClient.invalidateQueries({
          queryKey: trpc.group.getById.queryKey({ groupId: data.id }),
        });
        await queryClient.prefetchQuery(
          trpc.group.getById.queryOptions({
            groupId: data.id,
          })
        );
        router.replace(
          {
            pathname: '/(modal)/group/[groupId]/edit',
            params: { groupId: data.id, isNew: 'true' },
          },
          {
            relativeToDirectory: true,
          }
        );
      },
    })
  );
  useEffect(() => {
    if (mounted || !session?.user.id) return;
    setMounted(true);
    createGroup({
      name: 'New Group',
      createdById: session.user.id,
    });
  }, [mounted, session?.user.id]);

  if (!isLoadingSession && !session?.user.id) {
    return (
      <ErrorView
        message="You must be logged in to create a group"
        onRetry={() => router.push('/')}
        retryText="Login"
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          headerBlurEffect: 'none',
          headerTransparent: true,
          animation: 'fade',
        }}
      />
      <LoadingOverlay
        text="Creating group..."
        loading={isCreatingGroup || isLoadingSession}
        hostName="modal"
      />
    </>
  );
}
