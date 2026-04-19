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
  cancelProps?: ComponentProps<typeof AsyncButton>;

  cancelText?: ReactNode;
  confirmProps?: ComponentProps<typeof AsyncButton>;
  confirmText?: ReactNode;
  defaultOpen?: boolean;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  footer?: ReactNode;
  footerClassName?: ClassValue;
  onCancel?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;

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
  trigger,
  footer,
  footerClassName,
  cancelText,
  onCancel,
  cancelProps,
  confirmText,
  onConfirm,
  confirmProps,
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
      <AlertDialogContent>
        {(title || description) && (
          <AlertDialogHeader>
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
