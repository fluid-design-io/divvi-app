import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormItem, FormSection, FormTextField } from '~/components/nativewindui/Form';
import { FormScrollView } from '~/components/core/form-scroll-view';
import { updateGroupSchema } from '~/server/api/schema';
import { ListPlus, PencilLine } from 'lucide-react-native';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { GroupMembers } from '~/components/screen/edit-group-form';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { Toolbar, ToolbarIcon } from '~/components/nativewindui/Toolbar';
import { Alert } from 'react-native';
import { authClient } from '~/lib/auth/client';
import { KeyboardController } from 'react-native-keyboard-controller';
type UpsertGroupSchemaType = z.infer<typeof updateGroupSchema>;

export default function FormPage() {
  const queryClient = useQueryClient();
  const { groupId, isNew } = useLocalSearchParams<{ groupId: string; isNew?: string }>();
  const isNewGroup = isNew === 'true';
  const { data: session } = authClient.useSession();
  const { data: groupData, isFetching: isFetchingExistingGroup } = useQuery(
    trpc.group.getById.queryOptions({
      groupId,
    })
  );
  const { mutate: updateGroup, isPending: isUpsertingGroup } = useMutation(
    trpc.group.update.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.all.infiniteQueryKey() });
        await queryClient.invalidateQueries({
          queryKey: trpc.group.getById.queryKey({ groupId: data.id }),
        });
        router.back();
        router.setParams({ groupId: data.id });
      },
    })
  );
  const { mutate: saveOnBlur } = useMutation(
    trpc.group.update.mutationOptions({
      onSuccess: async (data) => {
        router.setParams({ groupId: data.id });
      },
    })
  );
  const { mutate: deleteGroup, isPending: isDeletingGroup } = useMutation(
    trpc.group.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.group.all.infiniteQueryKey() });
        router.back();
      },
    })
  );

  const form = useForm<UpsertGroupSchemaType>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: groupData,
  });

  const onSubmit = (data: UpsertGroupSchemaType) => {
    updateGroup(data);
    KeyboardController.dismiss();
  };
  const onBlurSave = (data: UpsertGroupSchemaType) => {
    saveOnBlur(data);
  };

  const name = form.watch('name');
  const description = form.watch('description');

  const disabled = isUpsertingGroup || isFetchingExistingGroup || isDeletingGroup;

  const isUserOwner = groupData?.members.some((member) => {
    return member.userId === session?.user.id && member.role === 'owner';
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          headerBlurEffect: 'none',
          headerTransparent: true,
          headerRight: () => (
            <Button
              size="none"
              variant="plain"
              onPress={form.handleSubmit(onSubmit)}
              disabled={disabled}>
              <Text className="text-primary">Save</Text>
            </Button>
          ),
        }}
      />

      <FormScrollView
        title={name ? name : 'New Group'}
        subtitle={description ? description : 'Group description'}
        onSubmit={form.handleSubmit(onSubmit)}
        footerBottomOffset={24}
        buttonText="Save"
        Icon={isNewGroup ? ListPlus : PencilLine}
        buttonDisabled={disabled}
        buttonLoading={isUpsertingGroup}
        footer={<></>}>
        <Form form={form} className="gap-6">
          <FormSection fields={['name', 'description']}>
            <FormItem>
              <FormTextField
                name="name"
                accessibilityLabel="name"
                placeholder="Hawaii Trip"
                label="Name"
                onBlur={form.handleSubmit(onBlurSave)}
              />
            </FormItem>
            <FormItem>
              <FormTextField
                name="description"
                accessibilityLabel="description"
                placeholder="Wonderful trip to Hawaii"
                label="Description"
                numberOfLines={3}
                multiline
                onBlur={form.handleSubmit(onBlurSave)}
              />
            </FormItem>
          </FormSection>
        </Form>
        <GroupMembers
          members={groupData?.members}
          editable
          isUserOwner={isUserOwner}
          groupId={groupId}
        />
      </FormScrollView>
      {isUserOwner && (
        <Toolbar
          className="absolute bottom-0 left-0 right-0"
          leftView={
            <ToolbarIcon
              onPress={() =>
                Alert.alert('Delete Group', 'Are you sure you want to delete this group?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => groupData?.id && deleteGroup({ groupId: groupData.id }),
                  },
                ])
              }
              icon={{ name: 'trash-can-outline' }}
            />
          }
        />
      )}
    </>
  );
}
