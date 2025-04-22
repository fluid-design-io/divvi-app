import { useQuery } from '@tanstack/react-query';
import { trpc } from '~/utils/api';

// help to check uuid format
function isUUID(str: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
}

export function useExistingGroup(existingGroupId?: string) {
  const queryOptions = isUUID(existingGroupId ?? '')
    ? trpc.group.getById.queryOptions({ groupId: existingGroupId! })
    : trpc.group.getMostRecentGroup.queryOptions();

  const { data: selectedGroup, isPending: isLoading } = useQuery(
    // @ts-expect-error query option Fn is different, but the return type is the same
    queryOptions
  );

  return {
    selectedGroup,
    isLoading,
  };
}
