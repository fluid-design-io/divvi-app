import { Text } from '~/components/nativewindui/Text';
import { Picker } from '@expo/ui/Picker';
import React from 'react';
import { Stack } from 'expo-router';
import { BodyScrollView } from '~/components/core/body-scroll-view';
import { Alert, View } from 'react-native';
import { TonalIcon } from '~/components/core/icon';
import LogoMono from '~/components/icon/logo-mono';
import {
  Member,
  Split,
  useDisplayInfo,
  useExpenseStore,
} from '~/components/screen/edit-expense-form';
import { formatCurrency, initials } from '~/utils/format';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { TextField } from '~/components/nativewindui/TextField';
import { Slider } from '~/components/nativewindui/Slider';
import { usePreventRemove } from '@react-navigation/native';
import { KeyboardController } from 'react-native-keyboard-controller';
const SPLIT_MODES = ['equal', 'percentage', 'exact'] as const;

export default function ExpenseDetails() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Expense Details',
          headerTitle: 'Expense Details',
          headerShown: true,
        }}
      />

      <BodyScrollView contentContainerClassName="p-4 gap-4">
        <ListHeaderComponent />
        <SplitDisplayInfo />
        <MembersList />
        <DebugInfo />
      </BodyScrollView>
    </>
  );
}

const ListHeaderComponent = React.memo(() => {
  const changeSplitType = useExpenseStore((s) => s.changeSplitType);
  const updateTitle = useExpenseStore((s) => s.updateTitle);
  const title = useExpenseStore((s) => s.expense?.title);
  const splitType = useExpenseStore((s) => s.expense?.splitType);

  return (
    <View className="gap-4 rounded-2xl bg-card p-4">
      <View className="mt-4 items-center pt-2">
        <TonalIcon Icon={LogoMono} />

        <TextField
          value={title}
          onChangeText={updateTitle}
          placeholder="Dinner at the new place"
          autoFocus
          className="text-center text-2xl"
          containerClassName="w-full"
          numberOfLines={1}
          maxLength={20}
          inputMode="text"
          autoCapitalize="words"
          onSubmitEditing={() => KeyboardController.dismiss()}
          returnKeyType="done"
        />

        <Text variant="subhead" className="px-4 pt-1 text-center text-muted-foreground">
          How do you want to split this expense?
        </Text>
      </View>
      <View className="mb-4 items-center">
        <Picker
          options={SPLIT_MODES.map((mode) => mode.charAt(0).toUpperCase() + mode.slice(1))}
          selectedIndex={SPLIT_MODES.indexOf(splitType ?? 'equal')}
          onOptionSelected={({ nativeEvent: { index } }) => {
            if (index != null) changeSplitType(SPLIT_MODES[index]);
          }}
        />
      </View>
    </View>
  );
});

const SplitDisplayInfo = React.memo(() => {
  const { expenseAmount, splitDescription } = useDisplayInfo();
  const isValid = useExpenseStore((s) => s.validateSplits);
  const preventRemove = !isValid().isValid;

  usePreventRemove(preventRemove, () => {
    Alert.alert('Invalid Split', isValid().message ?? 'Please fix the errors', [
      { text: 'OK', onPress: () => {} },
    ]);
  });
  return (
    <View className="items-center justify-center gap-2 rounded-2xl bg-card p-4">
      <Text variant="title2" className="font-rounded text-foreground">
        {formatCurrency(expenseAmount / 100)}
      </Text>
      <Text variant="subhead" className="text-muted-foreground">
        {splitDescription}
      </Text>
    </View>
  );
});

const MembersList = React.memo(() => {
  const members = useExpenseStore((s) => s.group?.members);
  const splits = useExpenseStore((s) => s.expense?.splits);

  return (
    <View className="rounded-2xl bg-card p-4">
      {members?.map((member) => (
        <MemberListItem
          key={member.id}
          member={member}
          split={splits?.find((s) => s.userId === member.userId)}
        />
      ))}
    </View>
  );
});

const MemberListItem = React.memo(({ member, split }: { member: Member; split?: Split }) => {
  const splitMode = useExpenseStore((s) => s.expense?.splitType);
  const onExactAmountChange = useExpenseStore((s) => s.updateExactAmount);
  if (!split) return <Text>No split found for {member.user.name}</Text>; // Should not happen if data is consistent

  const memberAmount = split.amount ?? 0;
  const displayAmount = formatCurrency(memberAmount / 100);
  const exactInputText = split.amount != null ? (split.amount / 100).toFixed(2) : '0.00';
  return (
    <View className="flex-row items-center justify-between gap-2">
      <View className="flex-1 flex-row items-center gap-2 py-1">
        <Avatar alt={member.user.name}>
          {member.user.image && <AvatarImage source={{ uri: member.user.image }} />}
          <AvatarFallback>
            <Text className="font-rounded">{initials(member.user.name)}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text variant="subhead" className="leading-none text-muted-foreground">
            {member.user.name}
          </Text>
          {splitMode === 'percentage' && (
            <PercentageSlider memberId={member.userId} value={split.percentage ?? 0} />
          )}
        </View>
      </View>
      <View className="min-w-[90px] flex-row items-center justify-end">
        {splitMode === 'exact' ? (
          <View className="bg-muted/20 flex-row items-center justify-start gap-2 rounded-md">
            <Text className="pl-2 font-rounded">$</Text>
            <View className="w-28">
              <TextField
                value={exactInputText}
                onChangeText={(v) => onExactAmountChange(member.userId, v)}
                keyboardType="numeric"
                placeholder="0.00"
                selectTextOnFocus
                className="font-rounded"
                placeholderClassName="font-rounded"
              />
            </View>
          </View>
        ) : splitMode === 'percentage' ? (
          <View className="items-end justify-center">
            <Text className="text-sm font-medium text-foreground">{split.percentage ?? 0}%</Text>
            <Text className="text-xs text-muted-foreground">{displayAmount}</Text>
          </View>
        ) : (
          <Text className="text-sm text-muted-foreground">{displayAmount}</Text>
        )}
      </View>
    </View>
  );
});

const PercentageSlider = React.memo(({ memberId, value }: { memberId: string; value: number }) => {
  const onPercentageChange = useExpenseStore((s) => s.updatePercentage);
  const { remainingPercentage } = useDisplayInfo();
  return (
    <Slider
      value={value}
      onValueChange={(v) => onPercentageChange(memberId, v)}
      minimumValue={0}
      maximumValue={100}
      upperLimit={value + remainingPercentage}
      step={1}
      tapToSeek
    />
  );
});

// =============================================
// List Footer Component (Refactored - Optional Debug)
// =============================================
const DebugInfo = () => {
  const mode = useExpenseStore((s) => s.expense?.splitType);
  const members = useExpenseStore((s) => s.group?.members);
  const splits = useExpenseStore((s) => s.expense?.splits);
  const amount = useExpenseStore((s) => s.expense?.amount);
  const isInitialized = useExpenseStore((s) => s.isInitialized);
  const isValid = useExpenseStore((s) => s.validateSplits);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <View className="mt-4 gap-8 rounded-lg border border-border bg-card p-4">
      <Text className="pb-1 text-xs font-bold uppercase text-muted-foreground">DEBUG INFO</Text>
      <Text selectable>Initialized: {isInitialized ? 'Yes' : 'No'}</Text>
      <Text selectable>Mode: {mode}</Text>
      <Text selectable>Valid: {isValid().isValid ? 'Yes' : 'No'}</Text>
      <Text selectable>Error: {isValid().message}</Text>
      <Text selectable className="text-xs">
        Members: {JSON.stringify(members, null, 2)}
      </Text>
      <Text selectable className="text-xs">
        Splits: {JSON.stringify(splits, null, 2)}
      </Text>
      <Text selectable className="text-xs">
        Total Amount (Cents): {amount}
      </Text>
    </View>
  );
};
