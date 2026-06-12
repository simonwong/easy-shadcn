"use client";

import type { ClassValue } from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import {
  Field as BaseField,
  FieldContent as BaseFieldContent,
  FieldDescription as BaseFieldDescription,
  FieldError as BaseFieldError,
  FieldLabel as BaseFieldLabel,
  FieldTitle as BaseFieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface FieldProps
  extends Omit<React.ComponentProps<"div">, "className" | "title"> {
  className?: ClassValue;
  contentClassName?: ClassValue;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  disabled?: boolean;
  error?: ReactNode;
  errorClassName?: ClassValue;
  htmlFor?: string;
  invalid?: boolean;
  label?: ReactNode;
  labelClassName?: ClassValue;
  orientation?: "vertical" | "horizontal" | "responsive";
  required?: boolean;
}

type FieldErrorMessage = { message?: string } | undefined;

export interface FieldErrorProps
  extends Omit<React.ComponentProps<typeof BaseFieldError>, "errors"> {
  errors?: FieldErrorMessage[];
  issues?: FieldErrorMessage[];
}

export const FieldError: React.FC<FieldErrorProps> = ({
  errors,
  issues,
  ...props
}) => <BaseFieldError errors={errors ?? issues} {...props} />;

export const Field: React.FC<FieldProps> = ({
  label,
  description,
  error,
  required,
  invalid,
  disabled,
  orientation = "vertical",
  htmlFor,
  labelClassName,
  descriptionClassName,
  errorClassName,
  contentClassName,
  children,
  className,
  ...restProps
}) => {
  const isInvalid = invalid ?? Boolean(error);
  const isInlineField = orientation !== "vertical";
  const hasFlatSlots =
    label !== undefined ||
    description !== undefined ||
    error !== undefined ||
    required !== undefined ||
    htmlFor !== undefined ||
    labelClassName !== undefined ||
    descriptionClassName !== undefined ||
    errorClassName !== undefined ||
    contentClassName !== undefined;

  const labelNode = label ? (
    <BaseFieldLabel className={cn(labelClassName)} htmlFor={htmlFor}>
      {label}
      {required && (
        <>
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
          <span className="sr-only">required</span>
        </>
      )}
    </BaseFieldLabel>
  ) : null;

  const descriptionNode = description ? (
    <BaseFieldDescription className={cn(descriptionClassName)}>
      {description}
    </BaseFieldDescription>
  ) : null;

  const errorNode = error ? (
    <FieldError className={cn(errorClassName)}>{error}</FieldError>
  ) : null;

  if (!hasFlatSlots) {
    return (
      <BaseField
        aria-disabled={disabled || undefined}
        className={cn(className)}
        data-disabled={disabled ? true : undefined}
        data-invalid={isInvalid ? true : undefined}
        orientation={orientation}
        {...restProps}
      >
        {children}
      </BaseField>
    );
  }

  return (
    <BaseField
      aria-disabled={disabled || undefined}
      className={cn(className)}
      data-disabled={disabled ? true : undefined}
      data-invalid={isInvalid ? true : undefined}
      orientation={orientation}
      {...restProps}
    >
      {isInlineField ? (
        <>
          {children}
          <BaseFieldContent className={cn("gap-1.5", contentClassName)}>
            {labelNode}
            {descriptionNode}
            {errorNode}
          </BaseFieldContent>
        </>
      ) : (
        <>
          {labelNode}
          <BaseFieldContent className={cn("gap-1.5", contentClassName)}>
            {children}
            {descriptionNode}
            {errorNode}
          </BaseFieldContent>
        </>
      )}
    </BaseField>
  );
};

const FieldContent = BaseFieldContent;
const FieldDescription = BaseFieldDescription;
const FieldLabel = BaseFieldLabel;
const FieldTitle = BaseFieldTitle;

export { FieldContent, FieldDescription, FieldLabel, FieldTitle };

export default Field;
