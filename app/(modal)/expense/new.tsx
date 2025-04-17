import { useQueryClient, useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { BadgeDollarSign } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormTitle } from '~/components/core/form-scroll-view';
import { TonalIcon } from '~/components/core/icon';

import { trpc } from '~/utils/api';

function NewExpenseModal() {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const { mutate: initializeExpense } = useMutation(
    trpc.expense.initialize.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.expense.getByGroupId.queryFilter());
        if (data) {
          console.log('>>> initialize expense', data);
          router.replace(`/expense/${data.id}`);
        }
      },
    })
  );

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      setTimeout(() => {
        initializeExpense();
      }, 200);
    }
  }, [mounted]);

  return (
    <View
      className="items-center justify-center"
      style={{
        paddingTop:
          // TODO: double check why we need to subtract 4 here
          insets.top - 4,
      }}>
      <TonalIcon Icon={BadgeDollarSign} />
      <FormTitle title="New Expense" />
      <ActivityIndicator />
    </View>
  );
}

export default NewExpenseModal;
