import { DynamicTabSwitcher, TabConfig } from '~/components/core/dynamic-tab-switcher';
import { TabType } from './types';

const tabs: TabConfig<TabType>[] = [
  {
    id: 'expenses',
    label: 'Expenses',
    icon: {
      name: 'format-list-bulleted',
      ios: {
        name: 'list.bullet',
        activeName: 'list.bullet',
      },
    },
  },
  {
    id: 'members',
    label: 'Members',
    icon: {
      name: 'account-circle',
      ios: {
        name: 'person.3',
        activeName: 'person.3.fill',
      },
    },
    activeColor: '#1758a3', // Custom active color for members tab
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: {
      name: 'chart-box',
      ios: {
        name: 'chart.pie',
        activeName: 'chart.pie.fill',
      },
    },
    activeColor: '#6f268c', // Custom active color for stats tab
  },
];

export function ListHeader({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: TabType;
  onSelectTab: (tab: TabType) => void;
}): JSX.Element {
  return <DynamicTabSwitcher tabs={tabs} selectedTab={selectedTab} onSelectTab={onSelectTab} />;
}
