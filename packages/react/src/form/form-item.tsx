import { ComponentProps, ReactNode } from 'react';
import { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormItem as InternalFormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '../../components/ui/form';

export type FormItemProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName> & {
  itemProps?: ComponentProps<typeof InternalFormItem>;
  label?: ReactNode;
  labelProps?: ComponentProps<typeof FormLabel>;
  description?: ReactNode;
  descriptionProps?: ComponentProps<typeof FormDescription>;
};

type FormItemFC = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FormItemProps<TFieldValues, TName>
) => JSX.Element;

export const FormItem: FormItemFC = ({
  itemProps,
  label,
  labelProps,
  description,
  descriptionProps,
  render,
  ...controllerProps
}) => {
  return (
    <FormField
      {...controllerProps}
      render={(params) => (
        <InternalFormItem {...itemProps}>
          {label && <FormLabel {...labelProps}>{label}</FormLabel>}
          <FormControl>{render(params)}</FormControl>
          {description && <FormDescription {...descriptionProps}>{description}</FormDescription>}
          <FormMessage />
        </InternalFormItem>
      )}
    />
  );
};

export default FormItem;
