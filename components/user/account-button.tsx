import Loading from '../core/loading';
import { TouchableBounce } from '../core/touchable-bounce';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';

const initials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
};

function AccountButton() {
  const { data: session } = authClient.useSession();
  if (!session) return <Loading />;
  return (
    <TouchableBounce>
      <Avatar alt="NativeWindUI Avatar">
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
