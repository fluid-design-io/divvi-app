import { Stack, useLocalSearchParams } from 'expo-router';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Loading from '~/components/core/loading';
import { ErrorView } from '~/components/core/error-view';
import { router } from 'expo-router';
import { CATEGORY_OPTIONS } from '~/components/screen/edit-expense-form';
import { trpc } from '~/utils/api';
import { useForm } from 'react-hook-form';
import { Form, FormSection, FormSelect, FormTextField } from '~/components/nativewindui/Form';
import { PencilLine } from 'lucide-react-native';
import { FormScrollView } from '~/components/core/form-scroll-view';

import { z } from 'zod';
import { updateExpenseSchema } from '~/server/api/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from 'react-native';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;

export default function EditExpense() {
  const queryClient = useQueryClient();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { data, isPending, isError, error } = useQuery(
    trpc.expense.getById.queryOptions({
      id: expenseId,
    })
  );
  const { mutate: updateExpense, isPending: isUpdatingExpense } = useMutation(
    trpc.expense.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.back();
      },
      onError: (error) =>
        Alert.alert('Error', error.message, [{ text: 'Back', onPress: () => router.back() }]),
    })
  );

  const form = useForm<UpdateExpenseSchema>({
    defaultValues: {
      id: expenseId,
      title: data?.title,
      description: data?.description,
      category: data?.category ?? 'other',
    },
    resolver: zodResolver(updateExpenseSchema),
  });

  const onSubmit = (data: UpdateExpenseSchema) => {
    updateExpense(data);
  };

  if (isPending) return <Loading />;
  if (isError)
    return <ErrorView message={error.message} onRetry={() => router.back()} retryText="Go Back" />;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              size="none"
              variant="plain"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isUpdatingExpense}>
              <Text className="font-medium text-primary">Save</Text>
            </Button>
          ),
        }}
      />
      <FormScrollView
        title={data?.title ?? 'Edit Expense'}
        subtitle={data?.description ?? 'Expense description'}
        onSubmit={form.handleSubmit(onSubmit)}
        footerBottomOffset={24}
        buttonText="Save"
        Icon={PencilLine}
        buttonDisabled={isUpdatingExpense}
        buttonLoading={isUpdatingExpense}
        contentContainerClassName="py-8"
        footer={<></>}>
        <Form form={form}>
          <FormSection fields={['title', 'description', 'category']}>
            <FormTextField name="title" label="Title" returnKeyType="next" />
            <FormTextField
              name="description"
              label="Description"
              returnKeyType="done"
              onSubmitEditing={() => form.handleSubmit(onSubmit)()}
            />
            <FormSelect name="category" label="Category" options={CATEGORY_OPTIONS} />
          </FormSection>
        </Form>
      </FormScrollView>
    </>
  );
}
