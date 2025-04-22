import { ChartConfig } from '~/components/web-ui/chart';
import { trpc } from '~/utils/api';
import { useGlobalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { timeframeInputSchema } from '~/server/api/schema';
import { useState, useMemo } from 'react';
import { View } from 'react-native';
import { EmptyView } from '~/components/core/empty-view';
import GroupExpenseChart from './group-expense-chart';

type Timeframe = z.infer<typeof timeframeInputSchema>['timeframe'];

// Define the chart configuration for expense categories
const chartConfig = {
  value: {
    label: 'Total Expenses',
  },
  food: {
    label: 'Food',
    color: 'rgb(var(--chart-1))',
  },
  transport: {
    label: 'Transport',
    color: 'rgb(var(--chart-2))',
  },
  accommodation: {
    label: 'Accommodation',
    color: 'rgb(var(--chart-3))',
  },
  entertainment: {
    label: 'Entertainment',
    color: 'rgb(var(--chart-4))',
  },
  shopping: {
    label: 'Shopping',
    color: 'rgb(var(--chart-5))',
  },
  utilities: {
    label: 'Utilities',
    color: 'rgb(var(--chart-6))',
  },
  other: {
    label: 'Other',
    color: 'rgb(var(--chart-7))',
  },
} satisfies ChartConfig;

export const GroupExpenseView = () => {
  const { groupId } = useGlobalSearchParams<{ groupId: string }>();
  const [timeFilter] = useState<Timeframe>('all');

  // Query for expense summary by category
  const { data: categoryData } = useQuery(
    trpc.expense.getSummaryByCategory.queryOptions(
      {
        groupId: groupId,
        timeframe: timeFilter,
      },
      {
        enabled: !!groupId,
      }
    )
  );

  // Query for expense summary by member
  const { data: memberData } = useQuery(
    trpc.expense.getSummaryByMember.queryOptions(
      {
        groupId: groupId,
        timeframe: timeFilter,
      },
      {
        enabled: !!groupId,
      }
    )
  );

  // Create dynamic member chart config based on the actual data
  const memberChartConfig = useMemo(() => {
    if (!memberData || memberData.length === 0) {
      return {
        value: {
          label: 'Total Spent',
        },
      } satisfies ChartConfig;
    }

    // Create a config object with a key for each member
    const config: Record<string, { label: string; color?: string }> = {
      value: {
        label: 'Total Spent',
      },
    };

    // Add a key for each member with a color
    memberData.forEach((member, index) => {
      config[member.name] = {
        label: member.name,
        color: `rgb(var(--chart-${index + 1}))`,
      };
    });

    return config satisfies ChartConfig;
  }, [memberData]);

  if (categoryData?.length === 0 || memberData?.length === 0) {
    return (
      <EmptyView
        title="No expenses yet"
        description="Add an expense to the group to see the chart"
        icon={{
          name: 'info.circle',
        }}
      />
    );
  }
  // Transform the category query data into the format expected by the chart
  const categorySpendingChartData =
    categoryData?.map((item) => ({
      name: item.category ?? 'other',
      value: item.total / 100,
      fill: chartConfig[item.category]?.color || 'rgb(var(--chart-7))',
    })) || [];

  const categoryCountChartData =
    categoryData?.map((item) => ({
      name: item.category ?? 'other',
      value: 1,
      fill: chartConfig[item.category]?.color || 'rgb(var(--chart-7))',
    })) || [];

  // Transform the member query data into the format expected by the chart
  const memberChartData =
    memberData?.map((item, index) => {
      return {
        name: item.name,
        value: item.total / 100,
        fill: `rgb(var(--chart-${index + 1}))`,
      };
    }) || [];

  return (
    <View className=" gap-4">
      {/* Expense Summary Chart by member */}
      <GroupExpenseChart
        title="Member Spending"
        unit="Total Spent"
        description="Total expenses paid by each member"
        dom={{
          matchContents: true,
          scrollEnabled: false,
        }}
        chartData={memberChartData}
        chartConfig={memberChartConfig}
      />

      {/* Expense Summary Chart by number of categories */}
      <GroupExpenseChart
        title="Number of Categories"
        unit="Categories"
        description="Number of categories in the group"
        dom={{
          matchContents: true,
          scrollEnabled: false,
        }}
        chartData={categoryCountChartData}
        chartConfig={chartConfig}
      />
      {/* Expense Summary Chart by category */}
      <GroupExpenseChart
        title="Category Spending"
        unit="Total Expenses"
        description="Total expenses by category"
        dom={{
          matchContents: true,
          scrollEnabled: false,
        }}
        chartData={categorySpendingChartData}
        chartConfig={chartConfig}
      />
    </View>
  );
};
