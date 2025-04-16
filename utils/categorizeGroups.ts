import type { InfiniteData } from '@tanstack/react-query';
import {
  differenceInDays,
  format,
  getMonth,
  getYear,
  isToday,
  isYesterday,
  startOfDay,
} from 'date-fns';
import { router, Href } from 'expo-router';

import type { ExtendedListDataItem } from '~/components/nativewindui/List';
import type { RouterOutputs } from '~/utils/api';

type Group = RouterOutputs['group']['all']['items'][number];
type GroupInfiniteData = InfiniteData<RouterOutputs['group']['all']>;

// Define the categories and their order
const CATEGORIES = [
  'Today',
  'Yesterday',
  'Previous 7 Days',
  // Months will be added dynamically
  // Years will be added dynamically
] as const;

type Category = (typeof CATEGORIES)[number] | string; // Month or Year strings

export function categorizeGroupsByDate(
  data: GroupInfiniteData | undefined | null
): ExtendedListDataItem[] {
  const groups: Group[] = data?.pages.flatMap((page) => page.items) ?? [];

  if (groups.length === 0) {
    return [];
  }

  const now = new Date();
  const startOfToday = startOfDay(now);
  const currentYear = getYear(now);

  const categorized: Record<Category, ExtendedListDataItem[]> = {};

  const createListItem = (item: Group): ExtendedListDataItem => ({
    id: item.id,
    title: item.name || 'Untitled Group',
    subTitle: item.description || '',
    value: item.updatedAt.toLocaleDateString() || '',
    onPress: () => {
      router.push({
        pathname: '/group/[id]',
        params: { id: item.id },
      } as unknown as Href);
    },
  });

  groups.forEach((item) => {
    const updatedAt = item.updatedAt;
    let category: Category | null = null;

    if (isToday(updatedAt)) {
      category = 'Today';
    } else if (isYesterday(updatedAt)) {
      category = 'Yesterday';
    } else if (differenceInDays(startOfToday, updatedAt) < 7) {
      category = 'Previous 7 Days';
    } else {
      const itemYear = getYear(updatedAt);
      if (itemYear === currentYear) {
        category = format(updatedAt, 'MMMM');
      } else {
        category = format(updatedAt, 'yyyy');
      }
    }

    if (category) {
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(createListItem(item));
    }
  });

  const finalListData: ExtendedListDataItem[] = [];
  const addedCategories = new Set<Category>();

  CATEGORIES.forEach((cat) => {
    if (categorized[cat]) {
      finalListData.push(cat);
      finalListData.push(...categorized[cat]);
      addedCategories.add(cat);
    }
  });

  const currentYearMonths = Object.keys(categorized)
    .filter(
      (key) =>
        !addedCategories.has(key) &&
        groups.some(
          (g) => format(g.updatedAt, 'MMMM') === key && getYear(g.updatedAt) === currentYear
        )
    )
    .sort((a, b) => {
      const dateA = groups.find((g) => format(g.updatedAt, 'MMMM') === a)!.updatedAt;
      const dateB = groups.find((g) => format(g.updatedAt, 'MMMM') === b)!.updatedAt;
      return getMonth(dateB) - getMonth(dateA);
    });

  currentYearMonths.forEach((month) => {
    if (categorized[month]) {
      finalListData.push(month);
      finalListData.push(...categorized[month]);
      addedCategories.add(month);
    }
  });

  const previousYears = Object.keys(categorized)
    .filter((key) => !addedCategories.has(key) && /^\d{4}$/.test(key))
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

  previousYears.forEach((year) => {
    if (categorized[year]) {
      finalListData.push(year);
      finalListData.push(...categorized[year]);
      addedCategories.add(year);
    }
  });

  return finalListData;
}
