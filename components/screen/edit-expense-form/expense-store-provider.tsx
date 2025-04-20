import { createContext, useContext, useRef, ReactNode, useMemo } from 'react';
import { useStore } from 'zustand';
import {
  createExpenseDetailsStore,
  ExpenseDetailsStore,
  ExpenseDetailsState,
  ExpenseDetailsActions,
} from './store';
import { formatCurrency } from '~/utils/format';
import { authClient } from '~/lib/auth/client';

// Type the context value
export type ExpenseStoreContextType = ExpenseDetailsStore | null;

const ExpenseStoreContext = createContext<ExpenseStoreContextType>(null);

interface ExpenseStoreProviderProps {
  children: ReactNode;
  // Pass initial data needed by the store here
  // You might fetch these in the parent and pass down, or load them here
  // initialExpense?: UpdateExpenseSchemaType; // Example, adjust as needed
  // initialGroup?: GroupData; // Example
}

export const ExpenseStoreProvider = ({ children }: ExpenseStoreProviderProps) => {
  const storeRef = useRef<ExpenseDetailsStore | null>(null); // Use ref to ensure store is created only once

  if (!storeRef.current) {
    // Pass any initial state fragments if necessary
    storeRef.current = createExpenseDetailsStore({
      /* expense: initialExpense, group: initialGroup */
      expense: {
        groupId: '',
        amount: 0,
        title: '',
        date: new Date(),
        paidById: '',
        category: 'other',
        description: '',
        splits: [],
      },
      group: undefined,
    });
  }

  return (
    <ExpenseStoreContext.Provider value={storeRef.current}>{children}</ExpenseStoreContext.Provider>
  );
};

// Custom hook to use the store
// Adds runtime check for provider existence
// <S,> specifies that S is a generic type parameter for the function
export const useExpenseStore = <S,>(
  selector: (state: ExpenseDetailsState & ExpenseDetailsActions) => S
): S => {
  const store = useContext(ExpenseStoreContext);
  if (!store) {
    throw new Error('useExpenseStore must be used within an ExpenseStoreProvider');
  }
  return useStore(store, selector);
};

// Example: Selector for display info (can be defined here or in the store file)
export const useDisplayInfo = () => {
  const expense = useExpenseStore((s) => s.expense);
  const group = useExpenseStore((s) => s.group);
  const { data: session } = authClient.useSession();
  const splits = expense?.splits ?? [];
  const totalAmount = expense?.amount ?? 0;
  const splitMode = expense?.splitType ?? 'equal';
  const numMembers = group?.members.length ?? 0;

  const currentTotalPercentage = splits.reduce((sum, split) => sum + (split.percentage ?? 0), 0);
  const currentTotalExact = splits.reduce((sum, split) => sum + (split.amount ?? 0), 0);

  const remainingPercentage = 100 - currentTotalPercentage;
  const remainingExactAmount = totalAmount - currentTotalExact;
  const totalExactAmount = currentTotalExact; // Renamed for clarity

  let splitDescription = '';

  const equalAmount = numMembers > 0 ? totalAmount / numMembers : 0;
  const userSplit = splits.find((split) => split.userId === session?.user.id);
  const userPayDescription = useMemo(
    () => `You pay ${formatCurrency((userSplit?.amount ?? 0) / 100)}`,
    [userSplit]
  );

  switch (splitMode) {
    case 'equal':
      splitDescription = `Split equally. ${formatCurrency(equalAmount / 100)} per person.`;
      break;
    case 'percentage':
      splitDescription = `Split by percentage. ${remainingPercentage}% remaining.`;
      break;
    case 'exact':
      const difference = totalAmount - totalExactAmount; // In cents
      splitDescription = `Enter exact amounts. `;
      if (Math.abs(difference) < 0.01) {
        splitDescription += `${formatCurrency(0)} remaining.`;
      } else if (difference > 0) {
        splitDescription += `${formatCurrency(difference / 100)} remaining.`;
      } else {
        splitDescription += `${formatCurrency(Math.abs(difference) / 100)} over assigned.`;
      }
      break;
    default:
      splitDescription = '';
  }

  return {
    remainingPercentage,
    remainingExactAmount,
    totalExactAmount,
    splitDescription,
    userPayDescription,
    splitMode,
    expenseAmount: totalAmount, // provide total amount if needed directly
    numMembers,
  };
};
