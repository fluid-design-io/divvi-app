import { useQueryClient, useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '~/components/nativewindui/Text';
import { trpc } from '~/utils/api';

function NewExpenseModal() {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

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
      initializeExpense();
    }
  }, [mounted]);

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator />
      <Text>Creating new expense...</Text>
    </View>
  );
}

export default NewExpenseModal;
