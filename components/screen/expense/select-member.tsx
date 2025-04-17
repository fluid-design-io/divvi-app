import { FormSelect } from '~/components/nativewindui/Form';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '~/utils/api';
import { createDropdownItem } from '~/components/nativewindui/DropdownMenu/utils';
import { authClient } from '~/lib/auth/client';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

type SelectMemberProps = {
  groupId?: string | null;
  selectedMemberId?: string;
  name: string;
  label: string;
};

export const SelectMember = ({
  groupId,
  selectedMemberId,
  name = 'paidBy',
  label = 'Paid by',
}: SelectMemberProps) => {
  const { data: group, isPending: isGroupPending } = useQuery(
    trpc.group.getById.queryOptions({ groupId: groupId ?? '' }, { enabled: !!groupId })
  );
  const { data: session } = authClient.useSession();
  // clear the selected member id if the group id changes
  const form = useFormContext();
  useEffect(() => {
    form.setValue(name, session?.user?.id ?? '');
  }, [groupId]);
  return (
    <FormSelect
      selectLabel={session?.user?.id === selectedMemberId ? `You` : 'Select a member'}
      label={label}
      name={name}
      buttonClassName="min-w-36"
      options={[
        ...(group?.members?.map((member) =>
          createDropdownItem({
            loading: isGroupPending,
            actionKey: member.id,
            title: member.user.id === session?.user?.id ? 'You' : member.user.name,
            state: {
              checked: selectedMemberId === member.user.id,
            },
          })
        ) ?? []),
      ]}
    />
  );
};
