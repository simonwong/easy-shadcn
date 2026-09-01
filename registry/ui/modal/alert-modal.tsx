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

type AlertModalActionProps = Omit<
  ComponentProps<typeof AsyncButton>,
  "children" | "onClick"
>;

const getSafeActionProps = (
  props: AlertModalActionProps | undefined
): AlertModalActionProps => {
  const {
    children: _ignoredChildren,
    onClick: _ignoredOnClick,
    ...safeProps
  } = (props ?? {}) as ComponentProps<typeof AsyncButton>;

  return safeProps;
};

export interface AlertModalProps {
  /**
   * Extra props for the cancel AsyncButton. The label, raw HTML, and click
   * handler are Compose-owned; use cancelText and onCancel.
   */
  cancelProps?: AlertModalActionProps;
  cancelText?: ReactNode;
  className?: ClassValue;
  /**
   * Extra props for the confirm AsyncButton. The label, raw HTML, and click
   * handler are Compose-owned; use confirmText and onConfirm.
   */
  confirmProps?: AlertModalActionProps;
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
  /**
   * Base UI AlertDialog's post-transition hook — fires after the open/close
   * animation completes (with the resulting `open` state). Forwarded straight
   * to the underlying AlertDialog. command-modal's adapter wires teardown here.
   */
  onOpenChangeComplete?: (open: boolean) => void;
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
  onOpenChangeComplete,
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
  const safeCancelProps = getSafeActionProps(cancelProps);
  const safeConfirmProps = getSafeActionProps(confirmProps);

  return (
    <AlertDialog
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
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
                  {...safeCancelProps}
                  onClick={async () => {
                    await onCancel?.();
                    close();
                  }}
                  variant={safeCancelProps.variant ?? "outline"}
                >
                  {cancelText ?? "Cancel"}
                </AsyncButton>
              )}
              <AsyncButton
                {...safeConfirmProps}
                onClick={async () => {
                  await onConfirm?.();
                  close();
                }}
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
