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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AsyncButton } from "../async-button";

type ModalActionProps = Omit<
  ComponentProps<typeof AsyncButton>,
  "children" | "dangerouslySetInnerHTML" | "onClick"
>;

const getSafeActionProps = (
  props: ModalActionProps | undefined
): ModalActionProps => {
  const {
    children: _ignoredChildren,
    dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
    onClick: _ignoredOnClick,
    ...safeProps
  } = (props ?? {}) as ComponentProps<typeof AsyncButton>;

  return safeProps;
};

export interface ModalProps {
  /**
   * Extra props for the default footer's cancel AsyncButton. The label, raw
   * HTML, and click handler are Compose-owned; use cancelText and onCancel.
   */
  cancelProps?: ModalActionProps;
  cancelText?: ReactNode;
  children?: ReactNode;
  className?: ClassValue;
  /**
   * Extra props for the default footer's confirm AsyncButton. The label, raw
   * HTML, and click handler are Compose-owned; use confirmText and onConfirm.
   */
  confirmProps?: ModalActionProps;
  confirmText?: ReactNode;
  contentClassName?: ClassValue;
  defaultOpen?: boolean;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  /** Prevents closing via outside clicks. Forwarded to the Base UI Dialog. */
  disablePointerDismissal?: boolean;
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
   * Base UI Dialog's post-transition hook — fires after the open/close
   * animation completes (with the resulting `open` state). Forwarded straight
   * to the underlying Dialog. command-modal's adapter wires teardown here.
   */
  onOpenChangeComplete?: (open: boolean) => void;
  open?: boolean;
  showCloseButton?: boolean;
  title?: ReactNode;
  titleClassName?: ClassValue;
  trigger?: ReactElement;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  defaultOpen,
  onOpenChange,
  title,
  titleClassName,
  description,
  descriptionClassName,
  children,
  contentClassName,
  className,
  disablePointerDismissal,
  footer,
  footerClassName,
  headerClassName,
  cancelProps,
  cancelText,
  onCancel,
  confirmProps,
  confirmText,
  onConfirm,
  trigger,
  showCloseButton = true,
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

  // The flat confirm/cancel footer only appears when asked for; a rejected
  // async handler skips close() (AsyncButton catches it), keeping the modal
  // open on errors.
  const hasDefaultFooter =
    onConfirm !== undefined ||
    onCancel !== undefined ||
    confirmText !== undefined ||
    cancelText !== undefined ||
    confirmProps !== undefined ||
    cancelProps !== undefined;
  const safeCancelProps = getSafeActionProps(cancelProps);
  const safeConfirmProps = getSafeActionProps(confirmProps);
  const footerNode =
    footer ??
    (hasDefaultFooter ? (
      <>
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
    ) : null);

  return (
    <Dialog
      disablePointerDismissal={disablePointerDismissal}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      open={currentOpen}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className={cn(className)}
        showCloseButton={showCloseButton}
      >
        {(title || description) && (
          <DialogHeader className={cn(headerClassName)}>
            {title && (
              <DialogTitle className={cn(titleClassName)}>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription
                className={cn(descriptionClassName)}
                render={<div />}
              >
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        {children && (
          <div className={cn("text-sm", contentClassName)}>{children}</div>
        )}
        {footerNode && (
          <DialogFooter className={cn(footerClassName)}>
            {footerNode}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
