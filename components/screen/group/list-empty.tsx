import { Info } from 'lucide-react-native';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';

// Displayed when the list is empty (e.g., no data).
export default function ListEmpty() {
  return (
    <View className="flex-1 items-center justify-center">
      <Info className="mb-2 h-6 w-6 text-muted-foreground" />
      <Text className="text-center text-sm text-muted-foreground">No items found</Text>
    </View>
  );
}
