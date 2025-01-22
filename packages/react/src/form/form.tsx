import React from 'react';
import { FieldValues, FormProviderProps } from 'react-hook-form';
import { Form as InternalForm } from '../../components/ui/form';

export type FormProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
> = {
  form: Omit<FormProviderProps<TFieldValues, TContext, TTransformedValues>, 'children'>;
} & React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;

export type FormFC = <
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props: FormProps<TFieldValues, TContext, TTransformedValues>
) => React.JSX.Element;

export const Form: FormFC = ({ form, children, ...props }) => {
  return (
    <InternalForm {...form}>
      <form {...props} onSubmit={props.onSubmit || ((e) => e.preventDefault())}>
        {children}
      </form>
    </InternalForm>
  );
};
