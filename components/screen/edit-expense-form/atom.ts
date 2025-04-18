import { z } from 'zod';

import { upsertExpenseSchema } from '~/server/api/schema';
import { atom } from 'jotai';

type UpdateExpenseSchemaType = z.infer<typeof upsertExpenseSchema>;

export const expenseAtom = atom<UpdateExpenseSchemaType | undefined>(undefined);
