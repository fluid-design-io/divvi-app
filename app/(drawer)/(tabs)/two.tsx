import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { authClient } from '~/lib/auth/client';

export default function Home() {
  const { data: session } = authClient.useSession();
  return (
    <>
      <Container>
        <Text>Hi {session?.user?.name}</Text>
        <Button title="Sign Out" onPress={() => authClient.signOut()} />
        <Text>{JSON.stringify(session, null, 2)}</Text>
      </Container>
    </>
  );
}
