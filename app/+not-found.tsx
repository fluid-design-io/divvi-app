import { Link, Stack, useSegments } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  const segments = useSegments();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center">
        <Text className={styles.title}>This screen doesn't exist.</Text>
        <Text className="font-rounded text-muted-foreground">{segments.join('/')}</Text>
        <Link href="/" className={styles.link}>
          <Text className={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = {
  title: `text-xl font-bold`,
  link: `mt-4 pt-4`,
  linkText: `text-base text-[#2e78b7]`,
};
