import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormItem, FormSection, FormTextField } from '~/components/nativewindui/Form';
import { authClient } from '~/lib/auth/client';
import { router, Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { Button } from '~/components/nativewindui/Button';
import { cn } from '~/lib/cn';
import { Text } from '~/components/nativewindui/Text';
import { BodyScrollView } from '~/components/core/body-scroll-view';

const formNameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type formNameSchemaType = z.infer<typeof formNameSchema>;

export default function FormPage() {
  const { data: session } = authClient.useSession();
  const form = useForm<formNameSchemaType>({
    resolver: zodResolver(formNameSchema),
    defaultValues: {
      name: session?.user?.name || '',
    },
  });

  const onSubmit = async (values: formNameSchemaType) => {
    await authClient.updateUser({
      name: values.name,
    });
    router.back();
  };

  const canSave = form.formState.isValid && form.formState.isDirty;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Name',
          headerTransparent: Platform.OS === 'ios',
          headerBlurEffect: 'systemMaterial',
          headerRight: Platform.select({
            ios: () => (
              <Button
                className="ios:px-0"
                disabled={!canSave}
                variant="plain"
                onPress={() => form.handleSubmit(onSubmit)()}>
                <Text className={cn(canSave && 'text-primary')}>Save</Text>
              </Button>
            ),
          }),
        }}
      />

      <BodyScrollView>
        <Form form={form} className="gap-5 px-4 pt-8">
          <Form form={form} className="gap-6">
            <FormSection fields={['name']}>
              <FormItem>
                <FormTextField
                  name="name"
                  accessibilityLabel="name"
                  placeholder="Enter name"
                  label="Name"
                  autoFocus
                />
              </FormItem>
            </FormSection>
          </Form>
          {Platform.OS !== 'ios' && (
            <View className="items-end">
              <Button
                className={cn('px-6', !canSave && 'bg-muted')}
                disabled={!canSave}
                onPress={() => {
                  router.back();
                }}>
                <Text>Save</Text>
              </Button>
            </View>
          )}
        </Form>
      </BodyScrollView>
    </>
  );
}
