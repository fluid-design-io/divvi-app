import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer'; // Use immer middleware
import { z } from 'zod';
import { RouterOutputs } from '~/utils/api';
import { createExpenseSchema } from '~/server/api/schema';
import { formatCurrency } from '~/utils/format'; // Import formatCurrency if needed in selectors/actions

// --- Types ---
export type CreateExpenseSchemaType = z.infer<typeof createExpenseSchema>;
export type GroupData = NonNullable<RouterOutputs['group']['getById']>;
export type Member = GroupData['members'][number];
export type Split = CreateExpenseSchemaType['splits'][number];

const SPLIT_MODES = ['equal', 'percentage', 'exact'] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

// --- State Interface ---
export interface ExpenseDetailsState {
  expense: CreateExpenseSchemaType | null;
  group: GroupData | null;
  isInitialized: boolean; // To track if initial data has been set
}

// --- Actions Interface ---
export interface ExpenseDetailsActions {
  // Initialization
  initialize: (initialExpense: CreateExpenseSchemaType, groupData: GroupData) => void;
  setGroupData: (groupData: GroupData) => void; // If group data needs external updates

  // Expense Property Updates
  updateAmount: (newAmount: number) => void;
  changeSplitType: (newSplitType: SplitMode) => void;
  updateTitle: (newTitle: string) => void;

  // Split Updates
  updatePercentage: (userId: string, percentage: number) => void;
  updateExactAmount: (userId: string, amountString: string) => void; // Takes string, converts to cents

  // Validation (Example)
  validateSplits: () => { isValid: boolean; message?: string };
}

// --- Store Definition ---
// We use a function to create the store so each instance gets its own state
export type ExpenseDetailsStore = ReturnType<typeof createExpenseDetailsStore>;

export const createExpenseDetailsStore = (
  initialState: Partial<ExpenseDetailsState> = {} // Allow passing initial state fragments if needed
) => {
  return createStore<ExpenseDetailsState & ExpenseDetailsActions>()(
    immer((set, get) => ({
      // --- Initial State ---
      expense: initialState.expense ?? null,
      group: initialState.group ?? null,
      isInitialized: false,

      // --- Actions ---

      initialize: (initialExpense, groupData) => {
        set((state) => {
          if (state.isInitialized) return; // Prevent re-initialization? Or allow reset?

          state.group = groupData;
          state.expense = initialExpense;

          // Initial split calculation if needed (similar to your useEffect)
          const numMembers = groupData.members.length;
          if (
            numMembers > 0 &&
            (!initialExpense.splits || initialExpense.splits.length !== numMembers)
          ) {
            console.log('Store: Initializing splits...');
            const defaultSplitType = initialExpense.splitType ?? 'equal';
            state.expense.splitType = defaultSplitType; // Ensure splitType is set
            state.expense.splits = calculateSplits(state.expense, groupData.members);
          }
          state.isInitialized = true;
        });
      },

      setPaidById: (paidById: string) => {
        set((state) => {
          if (!state.expense) return;
          state.expense.paidById = paidById;
        });
      },

      setGroupData: (groupData) => {
        set((state) => {
          // Decide if/how to update splits if members change significantly
          const membersChanged =
            state.group?.members.length !== groupData.members.length ||
            !state.group?.members.every((m, i) => m.id === groupData.members[i]?.id);

          state.group = groupData;

          if (membersChanged && state.expense) {
            console.warn('Store: Group members changed, recalculating splits.');
            state.expense.splits = calculateSplits(state.expense, groupData.members);
          }
        });
      },

      updateAmount: (newAmount) => {
        set((state) => {
          if (!state.expense || !state.group) return;
          state.expense.amount = newAmount;
          // Recalculate amounts within splits based on current mode
          state.expense.splits = calculateSplits(state.expense, state.group.members, true); // Pass flag to only update amounts
        });
      },

      updateTitle: (newTitle) => {
        set((state) => {
          if (!state.expense) return;
          state.expense.title = newTitle;
        });
      },

      changeSplitType: (newSplitType) => {
        set((state) => {
          if (!state.expense || !state.group || state.expense.splitType === newSplitType) return;
          console.log(`Store: Changing split mode to: ${newSplitType}`);
          state.expense.splitType = newSplitType;
          // Recalculate the whole split structure
          state.expense.splits = calculateSplits(state.expense, state.group.members);
        });
      },

      updatePercentage: (userId, percentage) => {
        set((state) => {
          if (!state.expense?.splits || state.expense.splitType !== 'percentage') return;

          const splits = state.expense.splits;
          const currentSplitIndex = splits.findIndex((s) => s.userId === userId);
          if (currentSplitIndex === -1) return;

          const otherMembersTotal = splits
            .filter((s) => s.userId !== userId)
            .reduce((sum, s) => sum + (s.percentage ?? 0), 0);

          let finalPercentage = percentage;
          if (otherMembersTotal + percentage > 100) {
            finalPercentage = Math.max(0, 100 - otherMembersTotal); // Cap value (ensure non-negative)
          }

          const split = state.expense.splits[currentSplitIndex];
          split.percentage = finalPercentage;
          split.amount = ((state.expense.amount ?? 0) * finalPercentage) / 100;
        });
      },

      updateExactAmount: (userId, amountString) => {
        set((state) => {
          if (!state.expense?.splits || state.expense.splitType !== 'exact') return;

          const split = state.expense.splits.find((s) => s.userId === userId);
          if (!split) return;

          // --- Conversion to Cents (assuming input is dollars.cents) ---
          const rawValue = amountString.replace(/[^0-9.]/g, '');
          console.log('rawValue', rawValue);
          let numericValueInCents = 0;
          if (rawValue) {
            const floatValue = parseFloat(rawValue);
            if (!isNaN(floatValue)) {
              numericValueInCents = Math.round(floatValue * 100);
            }
          }
          // --- End Conversion ---

          split.amount = numericValueInCents;
          split.percentage = 0; // Percentage not relevant in exact mode

          // Optional: Immediate validation check within the action
          // const totalExact = state.expense.splits.reduce((sum, s) => sum + (s.amount ?? 0), 0);
          // if (totalExact > state.expense.amount) {
          //     console.warn("Store: Exact amount exceeds total!");
          //     // Potentially revert or cap, or rely on validateSplits later
          // }
        });
      },

      validateSplits: () => {
        const { expense } = get(); // Use get() to access current state without subscribing
        if (!expense || !expense.splits) return { isValid: false, message: 'Expense data missing' };

        const totalAmount = expense.amount ?? 0;

        if (expense.splitType === 'percentage') {
          const totalPercentage = expense.splits.reduce((sum, s) => sum + (s.percentage ?? 0), 0);
          if (Math.abs(totalPercentage - 100) > 0.1) {
            return {
              isValid: false,
              message: `Percentages must add up to 100%. Current total: ${totalPercentage.toFixed(1)}%`,
            };
          }
        } else if (expense.splitType === 'exact') {
          const totalExactAmount = expense.splits.reduce((sum, s) => sum + (s.amount ?? 0), 0);
          if (Math.abs(totalExactAmount - totalAmount) > 0.01) {
            // Compare cents
            const difference = totalAmount - totalExactAmount;
            const formattedDiff = formatCurrency(Math.abs(difference) / 100);
            const message =
              difference > 0
                ? `Amounts are ${formattedDiff} less than the total.`
                : `Amounts are ${formattedDiff} more than the total.`;
            return { isValid: false, message: message };
          }
        }
        return { isValid: true };
      },
    }))
  );
};

// --- Helper: Split Calculation Logic (Moved outside the store definition for clarity) ---
// Added 'onlyUpdateAmounts' flag for amount-change scenario
function calculateSplits(
  currentExpense: CreateExpenseSchemaType,
  members: Member[],
  onlyUpdateAmounts: boolean = false
): Split[] {
  const { amount = 0, splitType = 'equal', splits: existingSplits = [] } = currentExpense;
  const count = members.length;
  if (count === 0) return [];

  const existingSplitsMap = new Map(existingSplits.map((s) => [s.userId, s]));

  switch (splitType) {
    case 'equal':
      const equalAmount = count > 0 ? amount / count : 0;
      const equalPercentage = count > 0 ? 100 / count : 0;
      return members.map((member) => ({
        userId: member.userId,
        amount: equalAmount,
        percentage: equalPercentage,
      }));

    case 'percentage':
      // Keep existing percentages if they are valid (sum ~100), otherwise reset to equal
      const currentTotalPercentage = existingSplits.reduce(
        (sum, s) => sum + (s.percentage ?? 0),
        0
      );
      // Only reset percentages if NOT just updating amounts
      const useExistingPercentages =
        onlyUpdateAmounts ||
        (Math.abs(currentTotalPercentage - 100) < 0.1 && existingSplits.length === count);

      return members.map((member) => {
        const existingSplit = existingSplitsMap.get(member.id);
        // If only updating amounts, or if percentages are valid, use existing %. Otherwise, default to equal %.
        const percentage = useExistingPercentages
          ? (existingSplit?.percentage ?? (count > 0 ? 100 / count : 0)) // Use existing or default if somehow missing
          : count > 0
            ? 100 / count
            : 0; // Reset to equal if invalid and not just updating amount

        return {
          userId: member.userId,
          percentage: percentage,
          amount: (amount * percentage) / 100,
          // id: existingSplit?.id,
          // settled: existingSplit?.settled ?? false,
        };
      });

    case 'exact':
      // If only updating amounts, don't change anything here - user input drives exact amounts.
      if (onlyUpdateAmounts) {
        // Ensure all members have a split entry, even if amount is 0 or default
        return members.map((member) => {
          const existingSplit = existingSplitsMap.get(member.id);
          return {
            userId: member.userId,
            amount: existingSplit?.amount ?? 0, // Keep existing exact amount
            percentage: 0,
            //  id: existingSplit?.id,
            //  settled: existingSplit?.settled ?? false,
          };
        });
      } else {
        // When switching TO exact mode (not just updating total amount)
        return members.map((member) => {
          const existingSplit = existingSplitsMap.get(member.userId);
          // Default to equal share when switching *to* exact, unless a value already exists
          // This provides a better starting point than potentially 0
          const exactAmount = existingSplit?.amount ?? (count > 0 ? amount / count : 0);
          return {
            userId: member.userId,
            amount: exactAmount,
            percentage: 0, // Percentage is not the source of truth here
            // id: existingSplit?.id,
            // settled: existingSplit?.settled ?? false,
          };
        });
      }

    default:
      console.error('Unknown split type:', splitType);
      return []; // Or return existingSplits
  }
}
