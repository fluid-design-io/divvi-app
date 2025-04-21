import type { InfiniteData } from '@tanstack/react-query';
import { Expense, ListDataItem, TabType, Member } from '~/components/screen/group-details';

export function transformGroupExpenseData<T extends TabType>({
  onPress,
  onDelete,
  onSettleUp,
  selectedTab,
  expenses,
  members,
}: {
  onPress: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
  onSettleUp: ({ balance, memberId }: { balance: number; memberId: string }) => void;
  selectedTab: T;
  expenses: InfiniteData<Expense> | undefined | null;
  members: Member[] | undefined | null;
}): ListDataItem<T>[] {
  switch (selectedTab) {
    case 'expenses':
      const flattenedExpenses = expenses?.pages.flatMap((page) => page.items) ?? [];
      const expenseListData = flattenedExpenses.map((item) => {
        const paidByName = (item.paidBy as any)?.name || 'Unknown';
        return {
          type: 'expense',
          id: item.id,
          title: item.title,
          subTitle: `Paid by ${paidByName}`,
          tertiaryText: item.description ?? undefined,
          originalData: item,
          onDelete: () => onDelete(item.id),
          onPress: () => onPress(item.id),
        };
      });
      return expenseListData as unknown as ListDataItem<T>[];
    case 'members':
      const memberListData = members?.map((item) => {
        return {
          type: 'member',
          id: item.id,
          title: item.user.name,
          subTitle: item.user.email,
          originalData: item,
          onPress: () => onPress(item.id),
          onSettleUp,
        };
      });
      return memberListData as unknown as ListDataItem<T>[];
    case 'stats':
      return [
        {
          id: 'stats',
          type: 'stats',
          title: 'Stats',
        },
      ] as unknown as ListDataItem<T>[];
    default:
      return [];
  }
}
