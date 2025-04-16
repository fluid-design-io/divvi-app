import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormItem, FormSection, FormTextField } from '~/components/nativewindui/Form';
import { FormScrollView } from '~/components/core/form-scroll-view';
import { authClient } from '~/lib/auth/client';
import { UserIcon } from 'lucide-react-native';
import { router } from 'expo-router';

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

  return (
    <FormScrollView
      title="Name"
      subtitle="Enter your name"
      onSubmit={form.handleSubmit(onSubmit)}
      buttonText="Save"
      Icon={UserIcon}
      buttonDisabled={!form.formState.isValid || form.formState.isSubmitting}>
      <Form form={form} className="gap-6">
        <FormSection fields={['name']}>
          <FormItem>
            <FormTextField
              name="name"
              accessibilityLabel="name"
              placeholder="Enter name"
              label="Name"
            />
          </FormItem>
        </FormSection>
      </Form>
    </FormScrollView>
  );
}
