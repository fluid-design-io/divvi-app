import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useGlobalSearchParams, useNavigation } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormItem, FormSection, FormTextField } from '~/components/nativewindui/Form';
import { FormScrollView } from '~/components/core/form-scroll-view';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RouterOutputs, trpc } from '~/utils/api';
import { useEffect, useState } from 'react';
import { usePreventRemove } from '@react-navigation/native';
import { Alert, View } from 'react-native';
import { updateExpenseSchema } from '~/server/api/schema';
import { BadgeDollarSign } from 'lucide-react-native';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { authClient } from '~/lib/auth/client';
import { SelectMember } from '~/components/screen/expense';
import { ListItem } from '~/components/nativewindui/List';
import { Icon } from '@roninoss/icons';

type UpdateExpenseSchemaType = z.infer<typeof updateExpenseSchema>;
type Group = NonNullable<RouterOutputs['expense']['getById']>['group'];

export default function FormPage() {
  const navigation = useNavigation();
  const { expenseId: id } = useGlobalSearchParams<{ expenseId: string }>();
  const { data: expense, isPending: isExpensePending } = useQuery(
    trpc.expense.getById.queryOptions({ id })
  );
  const { mutate: deleteExpense } = useMutation(trpc.expense.delete.mutationOptions());
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(expense?.group ?? null);
  const [preventRemove] = useState(true);
  const { colors } = useColorScheme();
  authClient.useSession();

  // prevent the user from leaving the screen unless they confirm
  usePreventRemove(preventRemove, ({ data }) => {
    Alert.alert('Are you sure you want to delete this expense?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteExpense({ id });
          navigation.dispatch(data.action);
        },
      },
    ]);
  });
  const form = useForm<UpdateExpenseSchemaType>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: {
      id,
      title: 'New Expense',
      amount: 0,
      splitType: 'equal',
    },
  });

  const onSubmit = async (data: UpdateExpenseSchemaType) => {
    console.log('>>> data', data);
  };

  const title = form.watch('title') ?? '';
  const paidBy = form.watch('paidBy');

  useEffect(() => {
    if (expense) {
      form.setValue('title', expense.title ?? '');
      form.setValue('description', expense.description ?? '');
      form.setValue('amount', expense.amount);
      form.setValue('paidBy', expense.paidBy.id);
      form.setValue('splitType', expense.splitType);
      form.setValue('date', expense.date ?? new Date());
      setSelectedGroup(expense.group);
    }
  }, [expense]);
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
        title={title.length > 0 ? title : 'New Expense'}
        onSubmit={form.handleSubmit(onSubmit)}
        buttonText="Save"
        Icon={BadgeDollarSign}>
        <Form form={form} className="gap-6">
          <FormSection fields={['groupId']} ios={{ title: 'Group' }} className="ios:pl-0">
            <ListItem
              index={0}
              item={{
                title: selectedGroup?.name ?? 'Loading...',
                subTitle: selectedGroup?.description ?? '',
              }}
              target="Cell"
              rightView={
                <View className="flex-1 flex-row items-center gap-0.5 px-2">
                  <Text className="text-muted-foreground">Change</Text>
                  <Icon name="chevron-right" size={22} color={colors.grey2} />
                </View>
              }
              disabled={isExpensePending}
              onPress={() => {}}
            />
          </FormSection>
          <FormSection fields={['amount', 'title', 'paidBy']} ios={{ title: 'Details' }}>
            <FormItem>
              <FormTextField
                name="amount"
                accessibilityLabel="amount"
                placeholder="Amount"
                label="Amount"
                keyboardType="decimal-pad"
                inputMode="decimal"
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
                selectedMemberId={paidBy}
              />
            </FormItem>
          </FormSection>
          <FormSection fields={['splits']}></FormSection>
        </Form>
      </FormScrollView>
    </>
  );
}
