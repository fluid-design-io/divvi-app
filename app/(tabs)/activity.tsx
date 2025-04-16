import { BodyScrollView } from '~/components/core/body-scroll-view';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';

export default function Activityvity() {
  const { data: session } = authClient.useSession();
  return (
    <>
      <BodyScrollView>
        <Text>Hi {session?.user?.name}</Text>
        <Button onPress={() => authClient.signOut()}>
          <Text>Sign Out</Text>
        </Button>
        <Text>{JSON.stringify(session, null, 2)}</Text>
      </BodyScrollView>
    </>
  );
}
