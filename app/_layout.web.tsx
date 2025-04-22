import { View, Text, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import '../global.css';

export default function WebLayout() {
  return (
    <View className="flex-1 bg-muted">
      <View className="flex-1 items-center justify-center px-4">
        <View className="items-center space-y-8">
          {/* Logo */}
          <Image
            source={require('~/assets/images/logo.png')}
            style={{ resizeMode: 'contain', height: 128, width: 128, borderRadius: 24 }}
          />

          {/* App Name */}
          <Text className="text-4xl font-bold text-black dark:text-white">Divvi</Text>

          {/* Tagline */}
          <Text className="max-w-md text-center text-xl text-gray-600 dark:text-gray-400">
            Your personal finance companion for smarter spending and saving
          </Text>

          {/* App Store Button */}
          <Link href="https://apps.apple.com/app/divvi" asChild>
            <Pressable className="rounded-full bg-[#9FCA2C] px-8 py-4 dark:bg-[#7f9640]">
              <Text className="text-lg font-semibold text-black dark:text-white">
                Download on the App Store
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
