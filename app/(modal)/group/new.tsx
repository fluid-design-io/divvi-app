import { router, Stack } from 'expo-router';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { useEffect, useState } from 'react';
import { LoadingOverlay } from '~/components/core/loading';

export default function NewGroup() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const { mutate: createGroup, isPending: isCreatingGroup } = useMutation(
    trpc.group.upsert.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.all.infiniteQueryKey() });
        await queryClient.invalidateQueries({
          queryKey: trpc.group.getById.queryKey({ groupId: data.id }),
        });
        router.replace(`/group/${data.id}/edit`);
      },
    })
  );
  useEffect(() => {
    if (mounted) return;
    createGroup({ name: 'New Group', description: 'Group description' });
    setMounted(true);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          headerBlurEffect: 'none',
          headerTransparent: true,
        }}
      />
      <LoadingOverlay text="Creating group..." loading={isCreatingGroup} hostName="modal" />
    </>
  );
}
