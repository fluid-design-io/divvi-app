import { View, Text, Linking, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function Support() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:panjiuzhen@gmail.com');
  };

  const handleDiscordPress = () => {
    Linking.openURL('https://discord.com/channels/1361576485110153328/1364090705840181318');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Support',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerTransparent: false,
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="mx-auto max-w-2xl p-6">
          <View className="space-y-6">
            <View className="rounded-lg bg-gray-50 p-6">
              <Text className="mb-2 text-lg font-semibold">Contact Us</Text>
              <Text className="mb-4 text-gray-600">
                If you have any questions, concerns, or feedback, please don't hesitate to reach out
                to us.
              </Text>
              <View className="space-y-2">
                <Link
                  href="mailto:panjiuzhen@gmail.com"
                  className="font-medium text-green-500"
                  onPress={handleEmailPress}>
                  panjiuzhen@gmail.com
                </Link>
                <Link
                  href="https://discord.com/channels/1361576485110153328/1364090705840181318"
                  className="font-medium text-indigo-500"
                  onPress={handleDiscordPress}>
                  Join our Discord for faster responses
                </Link>
              </View>
            </View>

            <View className="rounded-lg bg-gray-50 p-6">
              <Text className="mb-2 text-lg font-semibold">Frequently Asked Questions</Text>
              <View className="space-y-4">
                <View>
                  <Text className="mb-1 font-medium">How can I get help?</Text>
                  <Text className="text-gray-600">
                    You can reach out to us via email at any time. We typically respond within 24
                    hours.
                  </Text>
                </View>
                <View>
                  <Text className="mb-1 font-medium">What information should I include?</Text>
                  <Text className="text-gray-600">
                    Please include your account details and a detailed description of your issue or
                    question.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
