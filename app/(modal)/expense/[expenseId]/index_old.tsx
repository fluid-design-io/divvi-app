import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useGlobalSearchParams, useNavigation } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormItem, FormSection, FormTextField } from '~/components/nativewindui/Form';
import { FormScrollView } from '~/components/core/form-scroll-view';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RouterOutputs, trpc } from '~/utils/api';
import { useEffect, useState } from 'react';
import { usePreventRemove } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import { upsertExpenseSchema } from '~/server/api/schema';
import { BadgeDollarSign } from 'lucide-react-native';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { SelectMember } from '~/components/screen/expense';
import { ListItem } from '~/components/nativewindui/List';
import { Icon } from '@roninoss/icons';
import { atom, useAtom } from 'jotai';
import { formatCurrency, formatCurrencyInput } from '~/utils/format';

type UpdateExpenseSchemaType = z.infer<typeof upsertExpenseSchema>;
type Group = NonNullable<RouterOutputs['expense']['getById']>['group'];

export const selectedGrouIdAtom = atom<string | undefined>(undefined);

export default function FormPage() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors } = useColorScheme();
  const { expenseId: id, isNew } = useGlobalSearchParams<{ expenseId: string; isNew?: string }>();
  const [selectedGroupId, setSelectedGroupId] = useAtom(selectedGrouIdAtom);
  const { data: selectedGroupData } = useQuery(
    trpc.group.getById.queryOptions(
      { groupId: selectedGroupId ?? '' },
      { enabled: !!selectedGroupId }
    )
  );
  const { data: expense, isPending: isExpensePending } = useQuery(
    trpc.expense.getById.queryOptions({ id })
  );
  const { mutate: deleteExpense } = useMutation(trpc.expense.delete.mutationOptions());
  const { mutate: updateExpense, isPending: isUpdateExpensePending } = useMutation(
    trpc.expense.upsert.mutationOptions({
      onSuccess: async (data) => {
        setPreventRemove(false);
        await queryClient.invalidateQueries({
          queryKey: trpc.expense.getByGroupId.infiniteQueryKey({ groupId: data.groupId }),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.group.all.infiniteQueryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.group.getById.queryKey({ groupId: data.groupId }),
        });
        // we don't need to wait for this to finish
        queryClient.invalidateQueries({
          queryKey: trpc.expense.getById.queryKey({ id }),
        });
        router.dismissTo(`/group/${data.groupId}`);
      },
    })
  );
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(expense?.group ?? null);
  const [preventRemove, setPreventRemove] = useState(true);

  const form = useForm<UpdateExpenseSchemaType>({
    resolver: zodResolver(upsertExpenseSchema),
    defaultValues: {
      id,
      title: 'New Expense',
      amount: 0,
      splitType: 'equal',
    },
  });

  const onSubmit = async (data: UpdateExpenseSchemaType) => {
    console.log('❤️ Updating expense...');
    updateExpense(data);
  };

  const amount = form.watch('amount') ?? 0;
  const paidById = form.watch('paidById');

  useEffect(() => {
    if (expense) {
      console.log('💚 Setting expense values...', JSON.stringify(expense, null, 2));
      form.setValue('title', expense.title ?? '');
      form.setValue('description', expense.description ?? '');
      form.setValue('amount', expense.amount.toString() as unknown as number);
      form.setValue('paidById', expense.paidById);
      form.setValue('splitType', expense.splitType);
      form.setValue('date', expense.date ?? new Date());
      form.setValue('groupId', expense.groupId);
      setSelectedGroup(expense.group);
    }
  }, [expense]);

  useEffect(() => {
    if (selectedGroupId && selectedGroupData) {
      setSelectedGroup(selectedGroupData);
    }
  }, [selectedGroupId, selectedGroupData]);

  // prevent the user from leaving the screen unless they confirm
  usePreventRemove(preventRemove, ({ data }) => {
    // check if form has changes
    const hasChanges = form.formState.isDirty;
    const isValid = form.formState.isValid;
    const hasErrors = Object.keys(form.formState.errors).length > 0;
    console.log('💚 form state', form.formState.isDirty, form.formState.isValid, hasErrors);
    if (hasChanges) {
      Alert.alert(
        'Are you sure you want to leave?',
        'You have unsaved changes. If you leave, your changes will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              navigation.dispatch(data.action);
            },
          },
        ]
      );
      return;
    }
    // delete the expense if it's touched and invalid and has errors
    // or if it's new (since once they save, the `preventRemove` will be false)
    if ((!isValid && hasChanges && hasErrors) || isNew) {
      Alert.alert(
        'Are you sure you want to delete this expense?',
        'This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteExpense({ id });
              navigation.dispatch(data.action);
            },
          },
        ]
      );
      return;
    }
    // then we allow the user to leave
    navigation.dispatch(data.action);
  });
  useEffect(() => {
    // cleanup the selected group id
    setSelectedGroupId(undefined);
  }, []);
  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerLeft: () => (
            <Button variant="plain" size="none" onPress={() => router.back()}>
              <Text className="text-muted-foreground">Cancel</Text>
            </Button>
          ),
        }}
      />

      <FormScrollView
        title={formatCurrency(Number(amount))}
        titleClassName="font-rounded"
        onSubmit={form.handleSubmit(onSubmit)}
        buttonText="Save"
        Icon={BadgeDollarSign}
        footerBottomOffset={isNew ? 100 : 24}
        buttonDisabled={isExpensePending || isUpdateExpensePending}
        buttonLoading={isUpdateExpensePending}>
        <Form form={form} className="gap-6">
          <FormSection fields={['groupId']} ios={{ title: 'Group' }} className="ios:pl-0">
            <FormItem className="ios:pr-0">
              <ListItem
                index={0}
                item={{
                  title: selectedGroup?.name ?? 'Loading...',
                  subTitle: selectedGroup?.description ?? '\t',
                }}
                target="Cell"
                rightView={
                  <View className="flex-1 flex-row items-center gap-0.5 px-2">
                    <Text className="text-muted-foreground">Change</Text>
                    <Icon name="chevron-right" size={22} color={colors.grey2} />
                  </View>
                }
                disabled={isExpensePending}
                onPress={() => router.push(`/expense/${id}/select-group`)}
              />
            </FormItem>
          </FormSection>
          <FormSection fields={['amount', 'title', 'paidBy']} ios={{ title: 'Details' }}>
            <FormItem>
              <FormTextField
                name="amount"
                accessibilityLabel="amount"
                placeholder="Amount"
                label="Amount"
                keyboardType="numeric"
                inputMode="numeric"
                onChangeText={(text) =>
                  form.setValue('amount', formatCurrencyInput(text) as unknown as number)
                }
                autoFocus
              />
            </FormItem>
            <FormItem>
              <FormTextField
                name="title"
                accessibilityLabel="title"
                placeholder="What is this expense for?"
                label="Title"
              />
            </FormItem>
            <FormItem>
              <SelectMember
                name="paidBy"
                label="Paid by"
                groupId={selectedGroup?.id}
                selectedMemberId={paidById}
              />
            </FormItem>
          </FormSection>
          <FormSection fields={['splits']}></FormSection>
        </Form>
      </FormScrollView>
    </>
  );
}
