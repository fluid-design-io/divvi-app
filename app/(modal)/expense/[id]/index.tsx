import { usePreventRemove } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { router, useGlobalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { trpc } from '~/utils/api';

export default function Expense() {
  const navigation = useNavigation();
  const { mutate: deleteExpense } = useMutation(trpc.expense.delete.mutationOptions());
  const { id } = useGlobalSearchParams<{ id: string }>();
  const [preventRemove, setPreventRemove] = useState(true);

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

  const handleBack = () => {
    router.dismiss();
  };

  return (
    <View>
      <Text>Expense {id}</Text>
      <Button onPress={handleBack}>
        <Text>Back</Text>
      </Button>
    </View>
  );
}
