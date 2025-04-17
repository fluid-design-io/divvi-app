import { Controller, useFormContext } from 'react-hook-form';
import { View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { LeftLabel } from '~/components/nativewindui/Form/left-label';
import { DropdownMenu } from '~/components/nativewindui/DropdownMenu';
import { DropdownItem } from '~/components/nativewindui/DropdownMenu/types';
import { cn } from '~/lib/cn';

interface FormSelectProps {
  name: string;
  label: string;
  selectLabel?: string;
  accessibilityLabel?: string;
  options: DropdownItem[];
  buttonClassName?: string;
}

export function FormSelect({
  name,
  label,
  options,
  buttonClassName,
  selectLabel = 'Select...',
}: FormSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View className="flex-row items-center justify-start">
          <LeftLabel label={label} />
          <DropdownMenu items={options} onItemPress={(item) => field.onChange(item.actionKey)}>
            <Button variant="muted" className={cn('my-1 justify-between', buttonClassName)}>
              <Text>
                {options.find((option) => option.actionKey === field.value)?.title || selectLabel}
              </Text>
              <ChevronDown className="text-muted-foreground" size={16} />
            </Button>
          </DropdownMenu>
        </View>
      )}
    />
  );
}
