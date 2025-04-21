import { ListItem, ListRenderItemInfo } from '~/components/nativewindui/List';
import { formatCurrency, initials } from '~/utils/format';
import { ListDataItem } from './types';
import { Button } from '~/components/nativewindui/Button';
import { Check } from 'lucide-react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { cn } from '~/lib/cn';
import { authClient } from '~/lib/auth/client';
export const MemberListItem = (info: ListRenderItemInfo<ListDataItem<'members'>>) => {
  const { data: session } = authClient.useSession();
  const item = info.item;
  const { data } = useQuery(
    trpc.expense.getGroupBalances.queryOptions({
      groupId: info.item.originalData.groupId,
    })
  );
  const balance = data?.find((balance) => balance.userId === item.originalData.user.id)?.balance;
  const displayBalance =
    typeof balance === 'number'
      ? balance > 0
        ? `Gets back ${formatCurrency(balance / 100)}`
        : `Owes ${formatCurrency(Math.abs(balance) / 100)}`
      : 'Loading...';
  return (
    <ListItem
      {...{
        ...info,
        item: {
          ...item,
          tertiaryText: displayBalance,
        },
      }}
      variant="insets"
      rightView={
        session?.user.id === item.originalData.user.id ? null : (
          <View
            className={cn('flex-1 flex-row items-center gap-0.5 px-2', {
              hidden: balance === 0,
            })}>
            <Button
              variant="tonal"
              size="sm"
              onPress={() =>
                item.onSettleUp({
                  balance: balance ?? 0,
                  memberId: item.originalData.user.id,
                  memberName: item.originalData.user.name,
                })
              }>
              <Text className="text-xs">Settle up</Text>
            </Button>
          </View>
        )
      }
      leftView={
        <View className="pr-4">
          <View className="relative pl-2">
            {balance === 0 && (
              <View className="absolute -bottom-1 -right-1 z-10 flex items-center justify-center rounded-full border-2 border-background bg-primary p-0.5">
                <Check size={14} color="white" />
              </View>
            )}
            <Avatar alt={item.originalData.user.name}>
              {item.originalData.user.image && (
                <AvatarImage source={{ uri: item.originalData.user.image }} />
              )}
              <AvatarFallback>
                <Text className="font-rounded">{initials(item.originalData.user.name)}</Text>
              </AvatarFallback>
            </Avatar>
          </View>
        </View>
      }
      subTitleNumberOfLines={1}
      tertiaryTextClassName={cn(
        balance && {
          'text-destructive': balance < 0,
          'text-green-600 dark:text-green-400': balance > 0,
        }
      )}
    />
  );
};
