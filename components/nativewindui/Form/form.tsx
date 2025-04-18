import type { IconProps } from '@roninoss/icons';
import { Icon } from '@roninoss/icons';
import * as React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller, FormProvider, useFormContext, useFormState } from 'react-hook-form';
import type { TextInput, ViewProps, ViewStyle } from 'react-native';
import { Platform, View } from 'react-native';
import { KeyboardController } from 'react-native-keyboard-controller';

import { TextField } from '~/components/nativewindui/TextField';
import type { TextFieldProps } from '~/components/nativewindui/TextField/types';

import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { LeftLabel } from './left-label';

type FormProps = ViewProps & {
  form: UseFormReturn<any>;
};

const Form = React.forwardRef<View, FormProps>(({ className, form, children, ...props }, ref) => {
  const inputRefs = React.useRef<InputRefs>({});
  const { formState } = form;

  const onError = (errors: any) => {
    const fieldNames = Object.keys(errors);
    if (fieldNames.length > 0) {
      const firstErrorField = fieldNames[0];
      const ref = inputRefs.current[firstErrorField!];
      if (ref?.current) {
        ref.current.focus();
      }
    }
  };

  Form.displayName = 'Form';

  React.useEffect(() => {
    if (!formState.isSubmitSuccessful && formState.errors) {
      onError(formState.errors);
    }
  }, [formState.isSubmitSuccessful, formState.errors]);

  return (
    <FormProvider {...form}>
      <InputRefsContext.Provider value={inputRefs.current}>
        <View ref={ref} className={className} {...props}>
          {children}
        </View>
      </InputRefsContext.Provider>
    </FormProvider>
  );
});

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: 'continuous',
};

type FormSectionProps = ViewProps & {
  rootClassName?: string;
  footnote?: string;
  footnoteClassName?: string;
  ios?: {
    title: string;
    titleClassName?: string;
  };
  materialIconProps?: Omit<IconProps<'material'>, 'namingScheme' | 'ios'>;
} & {
  /**
   * Enables per-section error messages in a `Form`.
   *
   * @param fields - Array of the `name` attributes within the `FormSection`.
   *
   * @default undefined
   */
  fields?: string[] | undefined;
};

const FormSection = React.forwardRef<React.ElementRef<typeof View>, FormSectionProps>(
  (
    {
      fields,
      rootClassName,
      className,
      footnote,
      footnoteClassName,
      ios,
      materialIconProps,
      style = BORDER_CURVE,
      children: childrenProps,
      ...props
    },
    ref
  ) => {
    const { colors } = useColorScheme();

    const children = React.useMemo(() => {
      if (Platform.OS !== 'ios') return childrenProps;
      const childrenArray = React.Children.toArray(childrenProps);
      // Add isLast prop to last child
      return React.Children.map(childrenArray, (child, index) => {
        if (!React.isValidElement(child)) return child;
        const isLast = index === childrenArray.length - 1;
        if (typeof child === 'string') {
          console.log('FormSection - Invalid asChild element', child);
        }
        return React.cloneElement<ViewProps & { isLast?: boolean }, View>(
          typeof child === 'string' ? <></> : child,
          { isLast }
        );
      });
    }, [childrenProps]);

    return (
      <View
        className={cn(
          'relative',
          Platform.OS !== 'ios' && !!materialIconProps && 'flex-row gap-4',
          rootClassName
        )}>
        {Platform.OS === 'ios' && !!ios?.title && (
          <Text
            variant="footnote"
            className={cn('pb-1 pl-3 uppercase text-muted-foreground', ios?.titleClassName)}>
            {ios.title}
          </Text>
        )}
        {!!materialIconProps && (
          <View className="ios:hidden pt-0.5">
            <Icon color={colors.grey} size={24} {...(materialIconProps as IconProps<'material'>)} />
          </View>
        )}

        <View
          ref={ref}
          className={cn(
            'ios:overflow-hidden ios:rounded-lg ios:bg-card ios:gap-0 ios:pl-1 gap-4',
            className
          )}
          style={style}
          children={children}
          {...props}
        />
        <FormSectionFootnote
          footnote={footnote}
          fields={fields}
          footnoteClassName={footnoteClassName}
        />
      </View>
    );
  }
);

FormSection.displayName = 'FormSection';

const FormSectionFootnote = (props: {
  fields?: string[];
  footnote?: string;
  footnoteClassName?: string;
}) => {
  const { errors } = useFormState();
  const errorMessages =
    props.fields?.map((field) => getNestedValue(errors, field)?.message).filter(Boolean) ?? [];

  const footnote = errorMessages.length > 0 ? errorMessages[0] : props.footnote;
  if (!footnote) return null;
  return (
    <Text
      className={cn(
        'ios:pt-1 pl-3 pt-0.5',
        errorMessages.length > 0 ? 'text-destructive' : 'text-muted-foreground',
        props.footnoteClassName
      )}
      variant="footnote">
      {typeof footnote === 'string'
        ? footnote
        : typeof footnote.message === 'string'
          ? footnote.message
          : 'Unknown error'}
    </Text>
  );
};

const FormItem = React.forwardRef<
  View,
  ViewProps & {
    isLast?: boolean;
    iosSeparatorClassName?: string;
  }
>(({ className, isLast, iosSeparatorClassName, ...props }, ref) => {
  return (
    <>
      <View ref={ref} className={cn('ios:pr-1', className)} {...props} />
      {Platform.OS === 'ios' && !isLast && (
        <View className={cn('ml-2 h-px flex-1 bg-border', iosSeparatorClassName)} />
      )}
    </>
  );
});

FormItem.displayName = 'FormItem';

type InputRefs = Record<string, React.RefObject<any>>;

interface FormTextFieldProps extends TextFieldProps {
  name: string;
  inputRef?: React.RefObject<TextInput>;
  ios?: {
    hideLabel?: boolean;
  };
  modal?: boolean;
}
const InputRefsContext = React.createContext<InputRefs | null>(null);

const FormTextField = ({ name, placeholder, label, ios, ...props }: FormTextFieldProps) => {
  const { control, formState } = useFormContext();
  const { isSubmitting } = formState;
  const inputRef = React.useRef<TextInput>(null);
  const inputRefs = React.useContext(InputRefsContext);

  // Register the input ref with the InputRefsContext
  React.useEffect(() => {
    if (inputRefs && name) {
      inputRefs[name] = inputRef;
    }
    return () => {
      if (inputRefs && name) {
        delete inputRefs[name];
      }
    };
  }, [inputRefs, name]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, disabled }, fieldState: { error } }) => (
        <TextField
          ref={inputRef}
          value={value}
          placeholder={Platform.select({
            ios: placeholder,
            default: '',
          })}
          label={Platform.select({
            ios: undefined,
            default: label,
          })}
          leftView={Platform.select({
            default: undefined,
            ios: ios?.hideLabel ? undefined : (
              <LeftLabel label={label ?? ''} className={props.labelClassName} />
            ),
          })}
          onChangeText={props?.onChangeText ?? onChange}
          errorMessage={error ? (error.message ?? 'Unknown error') : undefined}
          onSubmitEditing={() => {
            if (props.returnKeyType === 'next') {
              KeyboardController.setFocusTo('next');
            }
          }}
          editable={props.editable ?? (!isSubmitting || !disabled)}
          {...props}
        />
      )}
    />
  );
};

// helper function to pick fields from the form with type safety, essentially a no-op
/**
 * Returns the fields to pick from the form.
 *
 * @param _form - The form to pick fields from.
 * @param fields - The fields to pick from the form.
 */
const pickFields = <T extends Record<string, any>>(
  _form: UseFormReturn<T>,
  fields: (keyof T)[]
) => {
  return fields;
};

// Utility function to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export { Form, FormItem, FormSection, FormTextField, pickFields };
export type { FormProps, FormSectionProps, FormTextFieldProps };
