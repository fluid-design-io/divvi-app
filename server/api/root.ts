import { authRouter } from './router/auth';
import { groupRouter } from './router/group';
import { expenseRouter } from './router/expense';
import { settlementRouter } from './router/settlement';
import { activityRouter } from './router/activity';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  group: groupRouter,
  expense: expenseRouter,
  settlement: settlementRouter,
  activity: activityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
