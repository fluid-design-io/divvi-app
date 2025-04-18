import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormItem, FormSection, FormTextField } from '~/components/nativewindui/Form';
import { FormScrollView } from '~/components/core/form-scroll-view';
import { upsertGroupSchema } from '~/server/api/schema';
import { ListPlus, PencilLine } from 'lucide-react-native';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GroupMembers } from '~/components/screen/edit-group-form';
type UpsertGroupSchemaType = z.infer<typeof upsertGroupSchema>;

export default function FormPage() {
  const queryClient = useQueryClient();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const isNewGroup = groupId === 'new';
  console.log(`❤️ Enabled: ${!isNewGroup}`);
  const { data: existingGroup, isFetching: isFetchingExistingGroup } = useQuery(
    trpc.group.getById.queryOptions(
      {
        groupId,
      },
      {
        enabled: !isNewGroup,
      }
    )
  );
  const { mutate: upsertGroup, isPending: isUpsertingGroup } = useMutation(
    trpc.group.upsert.mutationOptions({
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
  const groupForm = useForm<UpsertGroupSchemaType>({
    resolver: zodResolver(upsertGroupSchema),
    defaultValues: existingGroup,
  });

  const onSubmit = (data: UpsertGroupSchemaType) => {
    upsertGroup(data);
  };

  const name = groupForm.watch('name');
  const description = groupForm.watch('description');

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: true,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <FormScrollView
          title={name ? name : 'New Group'}
          subtitle={description ? description : 'Group description'}
          onSubmit={groupForm.handleSubmit(onSubmit)}
          buttonText="Save"
          Icon={isNewGroup ? ListPlus : PencilLine}
          buttonDisabled={isUpsertingGroup || isFetchingExistingGroup}
          buttonLoading={isUpsertingGroup}>
          <Form form={groupForm} className="gap-6">
            <FormSection fields={['name', 'description']}>
              <FormItem>
                <FormTextField
                  name="name"
                  accessibilityLabel="name"
                  placeholder="Enter name"
                  label="Name"
                />
              </FormItem>
              <FormItem>
                <FormTextField
                  name="description"
                  accessibilityLabel="description"
                  placeholder="Enter description"
                  label="Description"
                  numberOfLines={3}
                  multiline
                />
              </FormItem>
            </FormSection>
          </Form>
          <GroupMembers members={isNewGroup ? [] : existingGroup?.members} />
        </FormScrollView>
      </SafeAreaView>
    </>
  );
}
