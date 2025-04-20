import { Gauge } from '@expo/ui/Gauge';
import { PlatformColor, View } from 'react-native';

const COLORS = [
  PlatformColor('systemGreen'),
  PlatformColor('systemYellow'),
  PlatformColor('systemRed'),
];

export default function GaugeScreen() {
  return (
    <View className="w-full flex-1">
      <View className="w-[300px] flex-1">
        <Gauge label="label" current={{ value: 0.2 }} />
        <Gauge
          label="Usage"
          current={{ value: 70, label: '70%', color: PlatformColor('systemYellow') }}
          min={{ value: 0, label: '0', color: PlatformColor('systemGreen') }}
          max={{ value: 100, label: '100', color: PlatformColor('systemRed') }}
          color={COLORS}
          style={{ marginTop: 16 }}
        />
      </View>
      <View className="flex-1">
        <Gauge current={{ value: 0.2, label: '20%' }} color={COLORS} type="circular" />
        <Gauge
          current={{ value: 0.7, label: '70%' }}
          color={[...COLORS].reverse()}
          type="circularCapacity"
          style={{ marginTop: 16 }}
        />
      </View>
      <View className="flex-1">
        <Gauge
          label="linear label"
          current={{ value: 0.2, label: '20%' }}
          color={COLORS}
          type="linear"
          style={{ marginTop: 16 }}
        />
        <Gauge
          label="linearCapacity label"
          current={{ value: 0.7, label: '70%' }}
          color={COLORS}
          type="linearCapacity"
          style={{ marginTop: 16 }}
        />
      </View>
    </View>
  );
}

GaugeScreen.navigationOptions = {
  title: 'Gauge',
};
