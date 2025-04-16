import { Controller, useFormContext } from 'react-hook-form';
import { View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { LeftLabel } from '~/components/nativewindui/Form/left-label';
import { DropdownMenu } from '~/components/nativewindui/DropdownMenu';
import { DropdownItem } from '~/components/nativewindui/DropdownMenu/types';

interface FormSelectProps {
  name: string;
  label: string;
  accessibilityLabel?: string;
  options: DropdownItem[];
}

export function FormSelect({ name, label, options }: FormSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View className="flex-row items-center justify-between">
          <LeftLabel label={label} className="w-48" />
          <DropdownMenu items={options} onItemPress={(item) => field.onChange(item.actionKey)}>
            <Button variant="muted" className="my-1">
              <Text>
                {options.find((option) => option.actionKey === field.value)?.title || 'Select...'}
              </Text>
              <ChevronDown className="text-muted-foreground" size={16} />
            </Button>
          </DropdownMenu>
        </View>
      )}
    />
  );
}
