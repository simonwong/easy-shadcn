"use client";

import type { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ClassValue } from "clsx";
import type React from "react";
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog as AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AsyncButton } from "./async-button";

// Mirrors React's own rendering rules: null/undefined/boolean render nothing,
// but valid falsy nodes like 0 and "" must not be swallowed.
const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export interface AlertDialogProps
  extends Omit<
    AlertDialogPrimitive.Root.Props,
    "children" | "onOpenChange" | "render"
  > {
  cancelProps?: Omit<
    ComponentProps<typeof AsyncButton>,
    "children" | "onClick"
  >;
  cancelText?: ReactNode;
  className?: ClassValue;
  confirmProps?: Omit<
    ComponentProps<typeof AsyncButton>,
    "children" | "onClick"
  >;
  confirmText?: ReactNode;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  footer?: ReactNode;
  footerClassName?: ClassValue;
  headerClassName?: ClassValue;
  onCancel?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  showCancel?: boolean;
  size?: "default" | "sm";
  title?: ReactNode;
  titleClassName?: ClassValue;
  trigger?: ReactElement;
  variant?: "default" | "destructive";
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  titleClassName,
  description,
  descriptionClassName,
  headerClassName,
  cancelText,
  confirmText,
  showCancel = true,
  onCancel,
  onConfirm,
  cancelProps,
  confirmProps,
  footer,
  footerClassName,
  variant = "default",
  size,
  className,
  ...rootProps
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const currentOpen = open === undefined ? internalOpen : open;

  const handleOpenChange = (next: boolean) => {
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const close = () => handleOpenChange(false);

  const confirmVariant =
    confirmProps?.variant ??
    (variant === "destructive" ? "destructive" : undefined);

  return (
    <AlertDialogRoot
      onOpenChange={handleOpenChange}
      open={currentOpen}
      {...rootProps}
    >
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent className={cn(className)} size={size}>
        {(hasNode(title) || hasNode(description)) && (
          <AlertDialogHeader className={cn(headerClassName)}>
            {hasNode(title) && (
              <AlertDialogTitle className={cn(titleClassName)}>
                {title}
              </AlertDialogTitle>
            )}
            {hasNode(description) && (
              <AlertDialogDescription
                className={cn(descriptionClassName)}
                render={<div />}
              >
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
        )}
        <AlertDialogFooter className={cn(footerClassName)}>
          {hasNode(footer) ? (
            footer
          ) : (
            <>
              {showCancel && (
                <AsyncButton
                  onClick={async () => {
                    await onCancel?.();
                    close();
                  }}
                  variant="outline"
                  {...cancelProps}
                >
                  {cancelText ?? "Cancel"}
                </AsyncButton>
              )}
              <AsyncButton
                onClick={async () => {
                  await onConfirm?.();
                  close();
                }}
                {...confirmProps}
                variant={confirmVariant}
              >
                {confirmText ?? "OK"}
              </AsyncButton>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default AlertDialog;
