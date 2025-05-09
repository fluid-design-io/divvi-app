import { router } from 'expo-router';
import Loading from '../core/loading';
import { TouchableBounce } from '../core/touchable-bounce';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';
import { initials } from '~/utils/format';

function AccountButton() {
  const { data: session } = authClient.useSession();
  if (!session) return <Loading />;
  return (
    <TouchableBounce onPress={() => router.push('/profile')}>
      <Avatar alt={`${session.user.name}'s Profile`} className="h-8 w-8">
        <AvatarImage
          source={{
            uri: session?.user?.image ?? `https://ui-avatars.com/api/?name=${session?.user?.name}`,
          }}
        />
        <AvatarFallback>
          <Text className="text-foreground">{initials(session.user.name)}</Text>
        </AvatarFallback>
      </Avatar>
    </TouchableBounce>
  );
}

export default AccountButton;
