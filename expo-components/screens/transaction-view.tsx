import { observer } from '@legendapp/state/react';
import { Icon } from '@roninoss/icons';
import { Stack } from 'expo-router';
// import { Info } from 'lucide-react-native';
import { Platform, View } from 'react-native';

import { Button } from '../nativewindui/Button';

import {
  List,
  ESTIMATED_ITEM_HEIGHT,
  ListItem,
  ListRenderItemInfo,
  ListSectionHeader,
  ExtendedListDataItem,
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { transactions$ as _transactions$, transactions$, generateKeelId } from '~/lib/sync';
import { useColorScheme } from '~/lib/useColorScheme';

// Main component name placeholder
const TransactionView = observer(({ transactions$ }: { transactions$: typeof _transactions$ }) => {
  const transactions = transactions$.get();

  // Map the data to the shape needed for the List
  const DATA: ExtendedListDataItem[] = transactions
    ? Object.values(transactions)?.map((item) => ({
        id: item.id,
        title:
          item.amount?.amount?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }) || '',
        subTitle: item?.description || '',
        value: item.type || '',
      }))
    : [];

  if (!transactions) {
    return (
      <>
        <Stack.Screen options={{ title: 'No Transactions', headerShown: true }} />
        <Text>No transactions</Text>
        <Text>{JSON.stringify(transactions, null, 2)}</Text>
      </>
    );
  }

  return (
    <>
      {/* //! Optional Stack.Screen Placeholder */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: false,
          headerShadowVisible: false,
          headerTitle: `${Object.keys(transactions).length} transactions`,
        }}
      />

      <List
        variant="insets"
        data={DATA}
        renderItem={renderItem}
        sectionHeaderAsGap={Platform.OS === 'ios'}
        ListEmptyComponent={<ListEmpty />}
        ListHeaderComponent={<ListHeader />} //! remove if no header needed
        ListFooterComponent={<ListFooter />} //! remove if no footer needed
        estimatedItemSize={ESTIMATED_ITEM_HEIGHT.titleOnly}
        // refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentInsetAdjustmentBehavior="automatic"
      />
    </>
  );
});

//! Example: Custom List Header - remove if not needed
function ListHeader() {
  const handleAddTransaction = (amount: number) => {
    const id = generateKeelId();
    if (!id) {
      console.log('id is undefined');
      return;
    }
    console.log('id', id);
    transactions$[id].set({
      id,
      amount,
      type: 'transfer',
      description: 'Transfer',
      recipientId: '',
      senderId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionDate: new Date(),
    });
  };
  return (
    <View className="mb-4 gap-4 px-4">
      <Button onPress={() => handleAddTransaction({ amount: 10 })}>
        <Text>Add $10</Text>
      </Button>
      <Button variant="secondary" onPress={() => handleAddTransaction({ amount: 20 })}>
        <Text>Add $20</Text>
      </Button>
      <Button variant="secondary" onPress={() => handleAddTransaction({ amount: -5 })}>
        <Text>Remove $5</Text>
      </Button>
    </View>
  );
}

//! Example: Custom List Footer - remove if not needed
function ListFooter() {
  return (
    <View className="mt-4 px-4">
      <Text className="text-lg font-medium" variant="title1">
        Footer
      </Text>
    </View>
  );
}

// Displayed when the list is empty (e.g., no data).
function ListEmpty() {
  return (
    <View className="flex-1 items-center justify-center">
      {/* <Info className="mb-2 h-6 w-6 text-muted-foreground" /> */}
      <Text className="text-center text-sm text-muted-foreground">No items found</Text>
    </View>
  );
}

// Wrapper to pass the item info to the actual Item component
function renderItem(info: ListRenderItemInfo<ExtendedListDataItem>) {
  return <Item info={info} />;
}

// The actual ListItem (row) component.
function Item({ info }: { info: ListRenderItemInfo<ExtendedListDataItem> }) {
  const { colors } = useColorScheme();
  // If it's a string, treat it as a section header
  if (typeof info.item === 'string') {
    return <ListSectionHeader {...info} />;
  }

  return (
    <ListItem
      {...info}
      target="Cell"
      variant="insets"
      //! optional primary text if onPress is true
      // titleClassName={info.item.onPress && 'ios:text-primary'}
      rightView={
        <View className="flex-1 flex-row items-center gap-0.5 px-2">
          {!!info.item.value && <Text className="text-muted-foreground">{info.item.value}</Text>}
          {info.item.onPress && <Icon name="chevron-right" size={22} color={colors.grey2} />}
        </View>
      }
      disabled={info.item.disabled}
      onPress={info.item.onPress}
    />
  );
}

export default TransactionView;
