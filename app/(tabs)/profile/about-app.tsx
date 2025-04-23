import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert, Button, Image, StyleSheet, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';

export default function UpdatesDemo() {
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      // Update has successfully downloaded; apply it now
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  // If true, we show the button to download and run the update
  const showDownloadButton = isUpdateAvailable;

  // Show whether or not we are running embedded code or an update
  const runTypeMessage = currentlyRunning.isEmbeddedLaunch
    ? 'This app is running from built-in code'
    : 'This app is running an update';

  return (
    <>
      <Stack.Screen options={{ title: 'About Divvi' }} />
      <View style={styles.container}>
        <View className="items-center">
          <Image
            source={require('~/assets/images/logo.png')}
            className="ios:h-12 ios:w-12 h-8 w-8"
            resizeMode="contain"
          />
        </View>
        <Text variant="title1">Updates</Text>
        <Text>{runTypeMessage}</Text>
        <Button
          onPress={() =>
            Updates.checkForUpdateAsync().then((update) =>
              Alert.alert(update.isAvailable ? 'New update available' : 'No updates available')
            )
          }
          title="Check manually for updates"
        />
        {showDownloadButton ? (
          <Button onPress={() => Updates.fetchUpdateAsync()} title="Download and run update" />
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
});
