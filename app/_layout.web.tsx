import { View, Text, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function WebLayout() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-4">
        <View className="items-center space-y-8">
          {/* Logo */}
          <Image
            source={require('~/assets/expo/icon.png')}
            className="h-32 w-32 rounded-2xl"
            style={{ resizeMode: 'contain' }}
          />

          {/* App Name */}
          <Text className="text-4xl font-bold text-gray-900">Divvi</Text>

          {/* Tagline */}
          <Text className="max-w-md text-center text-xl text-gray-600">
            Your personal finance companion for smarter spending and saving
          </Text>

          {/* App Store Button */}
          <Link href="https://apps.apple.com/app/divvi" asChild>
            <Pressable className="rounded-full bg-black px-8 py-4">
              <Text className="text-lg font-semibold text-white">Download on the App Store</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
