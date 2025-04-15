import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the interface for our helper flags
interface HelperFlags {
  // Authentication related flags
  hasSeenWelcome: boolean;
  hasCompletedOnboarding: boolean;

  // Group related flags
  hasSeenGroupCreationTutorial: boolean;
  hasSeenGroupInviteTutorial: boolean;

  // Expense related flags
  hasSeenExpenseCreationTutorial: boolean;
  hasSeenExpenseSplitTutorial: boolean;
  hasSeenExpenseCategoriesTutorial: boolean;

  // Settlement related flags
  hasSeenSettlementTutorial: boolean;
  hasSeenSettlementHistoryTutorial: boolean;

  // Activity feed flags
  hasSeenActivityFeedTutorial: boolean;

  // Actions to update flags
  setFlag: (flagName: keyof Omit<HelperFlags, 'setFlag' | 'resetAllFlags'>) => void;
  resetAllFlags: () => void;
}

// Create the store with persistence
export const useHelperFlagsStore = create<HelperFlags>()(
  persist(
    (set) => ({
      // Default values for all flags
      hasSeenWelcome: false,
      hasCompletedOnboarding: false,
      hasSeenGroupCreationTutorial: false,
      hasSeenGroupInviteTutorial: false,
      hasSeenExpenseCreationTutorial: false,
      hasSeenExpenseSplitTutorial: false,
      hasSeenExpenseCategoriesTutorial: false,
      hasSeenSettlementTutorial: false,
      hasSeenSettlementHistoryTutorial: false,
      hasSeenActivityFeedTutorial: false,

      // Action to set a specific flag
      setFlag: (flagName) =>
        set((state) => ({
          ...state,
          [flagName]: true,
        })),

      // Action to reset all flags (useful for testing or if user wants to see tutorials again)
      resetAllFlags: () =>
        set({
          hasSeenWelcome: false,
          hasCompletedOnboarding: false,
          hasSeenGroupCreationTutorial: false,
          hasSeenGroupInviteTutorial: false,
          hasSeenExpenseCreationTutorial: false,
          hasSeenExpenseSplitTutorial: false,
          hasSeenExpenseCategoriesTutorial: false,
          hasSeenSettlementTutorial: false,
          hasSeenSettlementHistoryTutorial: false,
          hasSeenActivityFeedTutorial: false,
        }),
    }),
    {
      name: 'helper-flags-storage', // unique name for the storage
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage for persistence
    }
  )
);
