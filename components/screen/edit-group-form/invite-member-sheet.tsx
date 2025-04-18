import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Sheet } from '~/components/nativewindui/Sheet';
import { Text } from '~/components/nativewindui/Text';

export const InviteMemberSheet = ({
  onDismiss,
  ref,
}: {
  onDismiss: () => void;
  ref: React.RefObject<BottomSheetModal | null>;
}) => {
  return (
    <Sheet ref={ref} onDismiss={onDismiss} enableDynamicSizing={false}>
      <BottomSheetScrollView>
        <Text>Invite Member</Text>
      </BottomSheetScrollView>
    </Sheet>
  );
};
