"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ClassValue } from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import { isValidElement, useId } from "react";
import {
  Field as BaseField,
  FieldContent as BaseFieldContent,
  FieldDescription as BaseFieldDescription,
  FieldError as BaseFieldError,
  FieldLabel as BaseFieldLabel,
  FieldTitle as BaseFieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type FieldErrorItem = { message?: string } | undefined;

export interface FieldProps
  extends Omit<React.ComponentProps<"div">, "className"> {
  className?: ClassValue;
  contentClassName?: ClassValue;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  disabled?: boolean;
  error?: ReactNode | FieldErrorItem[];
  errorClassName?: ClassValue;
  htmlFor?: string;
  invalid?: boolean;
  label?: ReactNode;
  labelClassName?: ClassValue;
  orientation?: "vertical" | "horizontal" | "responsive";
  required?: boolean;
}

// RHF/zod issue arrays are plain objects, never renderable nodes — they get
// routed through the primitive's deduplicating errors list.
const toMessageArray = (
  error: FieldProps["error"]
): FieldErrorItem[] | null => {
  if (!Array.isArray(error)) {
    return null;
  }
  const isPlainItem = (item: unknown) =>
    item === null ||
    item === undefined ||
    (typeof item === "object" && !isValidElement(item));
  return error.every(isPlainItem) ? (error as FieldErrorItem[]) : null;
};

const RequiredMark = () => (
  <>
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
    <span className="sr-only">required</span>
  </>
);

type FlatFieldBodyProps = Pick<
  FieldProps,
  | "children"
  | "contentClassName"
  | "description"
  | "descriptionClassName"
  | "errorClassName"
  | "htmlFor"
  | "label"
  | "labelClassName"
  | "orientation"
  | "required"
> & {
  error: ReactNode;
  hasError: boolean;
  isInvalid: boolean;
  messageArray: FieldErrorItem[] | null;
};

const FlatFieldBody = ({
  children,
  contentClassName,
  description,
  descriptionClassName,
  error,
  errorClassName,
  hasError,
  htmlFor,
  isInvalid,
  label,
  labelClassName,
  messageArray,
  orientation,
  required,
}: FlatFieldBodyProps) => {
  const autoId = useId();

  const childElement = isValidElement(children) ? children : null;
  const childId = childElement
    ? (childElement.props as { id?: string }).id
    : undefined;
  const controlId =
    htmlFor ?? childId ?? (childElement ? `${autoId}-control` : undefined);
  const descriptionId = description ? `${autoId}-description` : undefined;
  const errorId = hasError ? `${autoId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  // Wire the control for assistive technologies. Slot lets explicit props on
  // the child win, so user-provided id/aria-* always take precedence.
  const control = childElement ? (
    <Slot
      aria-describedby={describedBy}
      aria-invalid={isInvalid || undefined}
      id={controlId}
    >
      {children}
    </Slot>
  ) : (
    children
  );

  const labelNode = label ? (
    <BaseFieldLabel className={cn(labelClassName)} htmlFor={controlId}>
      {label}
      {required && <RequiredMark />}
    </BaseFieldLabel>
  ) : null;

  const descriptionNode = description ? (
    <BaseFieldDescription
      className={cn(descriptionClassName)}
      id={descriptionId}
    >
      {description}
    </BaseFieldDescription>
  ) : null;

  const errorNode = hasError ? (
    <BaseFieldError
      className={cn(errorClassName)}
      errors={messageArray ?? undefined}
      id={errorId}
    >
      {messageArray ? undefined : error}
    </BaseFieldError>
  ) : null;

  const isInlineField = orientation !== "vertical";
  return (
    <>
      {isInlineField ? control : labelNode}
      <BaseFieldContent className={cn("gap-1.5", contentClassName)}>
        {isInlineField ? labelNode : control}
        {descriptionNode}
        {errorNode}
      </BaseFieldContent>
    </>
  );
};

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
  const messageArray = toMessageArray(error);
  const hasError = messageArray
    ? messageArray.some((item) => item?.message)
    : Boolean(error);
  const isInvalid = invalid ?? hasError;
  // Only content slots switch to the flat layout; bare styling/marker props
  // must not restructure composition-mode children.
  const hasFlatSlots =
    label !== undefined || description !== undefined || error !== undefined;

  return (
    <BaseField
      aria-disabled={disabled || undefined}
      className={cn(className)}
      data-disabled={disabled ? true : undefined}
      data-invalid={isInvalid ? true : undefined}
      orientation={orientation}
      {...restProps}
    >
      {hasFlatSlots ? (
        <FlatFieldBody
          contentClassName={contentClassName}
          description={description}
          descriptionClassName={descriptionClassName}
          error={error as ReactNode}
          errorClassName={errorClassName}
          hasError={hasError}
          htmlFor={htmlFor}
          isInvalid={isInvalid}
          label={label}
          labelClassName={labelClassName}
          messageArray={messageArray}
          orientation={orientation}
          required={required}
        >
          {children}
        </FlatFieldBody>
      ) : (
        children
      )}
    </BaseField>
  );
};

const FieldContent = BaseFieldContent;
const FieldDescription = BaseFieldDescription;
const FieldError = BaseFieldError;
const FieldLabel = BaseFieldLabel;
const FieldTitle = BaseFieldTitle;

export { FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle };

export default Field;
