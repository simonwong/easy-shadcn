"use client";

import type { ClassValue } from "class-variance-authority/types";
import type React from "react";
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AsyncButton } from "../async-button";

export interface AlertModalProps {
  afterClose?: () => void;
  /**
   * Extra props for the cancel AsyncButton. Passing `onClick` replaces the
   * built-in close handler — prefer `onCancel`.
   */
  cancelProps?: ComponentProps<typeof AsyncButton>;
  cancelText?: ReactNode;
  className?: ClassValue;
  /**
   * Extra props for the confirm AsyncButton. Passing `onClick` replaces the
   * built-in confirm-and-close handler — prefer `onConfirm`.
   */
  confirmProps?: ComponentProps<typeof AsyncButton>;
  confirmText?: ReactNode;
  defaultOpen?: boolean;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  /** Overrides the default confirm/cancel footer entirely. */
  footer?: ReactNode;
  footerClassName?: ClassValue;
  headerClassName?: ClassValue;
  /**
   * Called when the cancel button is pressed. May return a Promise — the
   * button shows a pending state and the modal stays open until it resolves;
   * a rejection keeps the modal open.
   */
  onCancel?: () => void | Promise<void>;
  /**
   * Called when the confirm button is pressed. May return a Promise — the
   * button shows a pending state and the modal stays open until it resolves;
   * a rejection keeps the modal open.
   */
  onConfirm?: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  /** Hide the cancel button for single-action alerts. @default true */
  showCancel?: boolean;
  /** Forwarded to the AlertDialogContent primitive. */
  size?: "default" | "sm";
  title?: ReactNode;
  titleClassName?: ClassValue;
  trigger?: ReactElement;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  open,
  defaultOpen,
  onOpenChange,
  title,
  titleClassName,
  description,
  descriptionClassName,
  className,
  headerClassName,
  size,
  trigger,
  footer,
  footerClassName,
  cancelText,
  onCancel,
  cancelProps,
  confirmText,
  onConfirm,
  confirmProps,
  showCancel = true,
  afterClose,
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

  return (
    <AlertDialog
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={(o) => {
        if (!o) {
          afterClose?.();
        }
      }}
      open={currentOpen}
    >
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent className={cn(className)} size={size}>
        {(title || description) && (
          <AlertDialogHeader className={cn(headerClassName)}>
            {title && (
              <AlertDialogTitle className={cn(titleClassName)}>
                {title}
              </AlertDialogTitle>
            )}
            {description && (
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
          {footer ?? (
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
              >
                {confirmText ?? "OK"}
              </AsyncButton>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
