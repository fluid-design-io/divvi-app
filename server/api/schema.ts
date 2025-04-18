import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

// Import database schemas
import { group, groupMember, expense, expenseSplit, settlement, activity } from '~/db/schema/app';

// ==========================================
// Common Validation Schemas
// ==========================================

const positiveDecimalSchema = z.coerce
  .number({
    message: 'Invalid amount',
  })
  .positive()
  .refine(
    (amount) => {
      const amountString = amount.toString();
      const decimalPart = amountString.split('.')[1];
      return !decimalPart || decimalPart.length <= 2;
    },
    {
      message: 'The amount can only have 2 decimal places',
    }
  );

// ==========================================
// Common Validation Constants
// ==========================================

// Category values for validation
export const categoryValues = [
  'food',
  'transport',
  'accommodation',
  'entertainment',
  'shopping',
  'utilities',
  'other',
] as const;

// Split type values for validation
export const splitTypeValues = ['equal', 'percentage', 'exact'] as const;

// Settlement status values for validation
export const settlementStatusValues = ['pending', 'completed'] as const;

// ==========================================
// Group Schemas
// ==========================================

// Create group schema
export const createGroupSchema = createInsertSchema(group, {
  // Remove fields that should be generated on the server
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

// Update group schema
export const upsertGroupSchema = createUpdateSchema(group, {
  name: z.string({ required_error: 'Name is required' }).min(1, { message: 'Name is required' }),
  createdAt: undefined,
  updatedAt: undefined,
});

// Add member schema
export const addMemberSchema = createInsertSchema(groupMember, {
  id: undefined,
  joinedAt: undefined,
});

// ==========================================
// Expense Schemas
// ==========================================

// Create expense schema
export const createExpenseSchema = createInsertSchema(expense, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

// Create expense split schema
export const createExpenseSplitSchema = createInsertSchema(expenseSplit, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  settled: undefined,
});

// Extended schema for creating expense with splits in one operation
export const createExpenseWithSplitsSchema = z.object({
  expense: createExpenseSchema,
  splits: z.array(createExpenseSplitSchema),
});

// Upsert expense schema
export const upsertExpenseSchema = createUpdateSchema(expense, {
  amount: positiveDecimalSchema,
}).extend({
  splits: z.array(createUpdateSchema(expenseSplit)).optional(),
});

// ==========================================
// Settlement Schemas
// ==========================================

// Create settlement schema
export const createSettlementSchema = createInsertSchema(settlement, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  settledAt: undefined,
  status: undefined,
});

// ==========================================
// Activity Schemas
// ==========================================

// Create activity schema
export const createActivitySchema = createInsertSchema(activity, {
  id: undefined,
  createdAt: undefined,
});

// ==========================================
// Common Input Schemas
// ==========================================

// Pagination input schema
export const paginationInputSchema = z.object({
  limit: z.number().positive().optional().default(20),
  cursor: z.string().uuid().optional(),
});

// Group ID input schema
export const groupIdInputSchema = z.object({
  groupId: z.string().uuid(),
});

// Combined group ID and pagination schema
export const groupIdWithPaginationSchema = z.object({
  groupId: z.string().uuid(),
  limit: z.number().positive().optional().default(20),
  cursor: z
    .object({
      date: z.date(),
      id: z.string().uuid(),
    })
    .nullish(),
  searchTerm: z.string().optional(),
});

// Timeframe input schema
export const timeframeInputSchema = z.object({
  timeframe: z.enum(['week', 'month', 'year', 'all']).optional().default('all'),
});

// Combined group ID and timeframe schema
export const groupIdWithTimeframeSchema = z.object({
  groupId: z.string().uuid(),
  timeframe: z.enum(['week', 'month', 'year', 'all']).optional().default('all'),
});
