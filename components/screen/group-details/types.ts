import { ExtendedListDataItem } from '~/components/nativewindui/List';
import { RouterOutputs } from '~/utils/api';

export type TabType = 'expenses' | 'members' | 'stats';

export type Expense = RouterOutputs['expense']['getByGroupId'];
export type Member = NonNullable<RouterOutputs['group']['getById']>['members'][number];

export type ExpenseItem = Expense['items'][number];
export type MemberItem = Member;

type ModifedExtendedListDataItem = Omit<Exclude<ExtendedListDataItem, string>, 'onPress'>;

interface ExpenseListDataItem extends ModifedExtendedListDataItem {
  type: 'expense';
  onPress: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
  originalData: ExpenseItem;
}

interface MemberListDataItem extends ModifedExtendedListDataItem {
  type: 'member';
  onPress: (expenseId: string) => void;
  onSettleUp: ({
    balance,
    memberId,
    memberName,
  }: {
    balance: number;
    memberId: string;
    memberName: string;
  }) => void;
  originalData: MemberItem;
}

interface StatsListDataItem extends ModifedExtendedListDataItem {
  type: 'stats';
}

export type ListDataItem<T extends TabType> = T extends 'expenses'
  ? ExpenseListDataItem
  : T extends 'members'
    ? MemberListDataItem
    : StatsListDataItem;
