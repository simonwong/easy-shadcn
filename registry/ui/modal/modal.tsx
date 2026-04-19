"use client";

import type { ClassValue } from "class-variance-authority/types";
import type React from "react";
import { type ReactElement, type ReactNode, useState } from "react";
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

export interface ModalProps {
  afterClose?: () => void;
  bodyClassName?: ClassValue;
  children?: ReactNode;

  className?: ClassValue;
  defaultOpen?: boolean;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  footer?: ReactNode;
  footerClassName?: ClassValue;
  onOpenChange?: (open: boolean) => void;
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
  bodyClassName,
  className,
  footer,
  footerClassName,
  trigger,
  showCloseButton = true,
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

  return (
    <Dialog
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={(o) => {
        if (!o) {
          afterClose?.();
        }
      }}
      open={currentOpen}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className={cn(className)}
        showCloseButton={showCloseButton}
      >
        {(title || description) && (
          <DialogHeader>
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
          <div className={cn("text-sm", bodyClassName)}>{children}</div>
        )}
        {footer && (
          <DialogFooter className={cn(footerClassName)}>{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
