import { authRouter } from './router/auth';
import { expenseRouter } from './router/expense';
import { groupRouter } from './router/group';
import { settlementRouter } from './router/settlement';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  group: groupRouter,
  expense: expenseRouter,
  settlement: settlementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
