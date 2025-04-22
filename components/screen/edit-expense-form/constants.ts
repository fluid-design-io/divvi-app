import { Category } from '~/server/api/schema';

export const CATEGORIES: Record<Category, { ios: { name: string } }> = {
  food: { ios: { name: 'fork.knife' } },
  transport: { ios: { name: 'car' } },
  accommodation: { ios: { name: 'house' } },
  entertainment: { ios: { name: 'film' } },
  shopping: { ios: { name: 'cart' } },
  utilities: { ios: { name: 'bolt' } },
  other: { ios: { name: 'dollarsign.circle' } },
};
