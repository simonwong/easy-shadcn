import React, { ComponentProps, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { DialogProps } from '@radix-ui/react-dialog';
import { cn } from '@easy-shadcn/utils';
import { DialogAnimateContent } from '@/components/animate/dialog-animate';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface ModalProps extends DialogProps {
  title?: ReactNode;
  titleProps?: ComponentProps<typeof DialogTitle>;
  description?: ReactNode;
  descriptionProps?: ComponentProps<typeof DialogDescription>;
  footer?: ReactNode;
  footerProps?: ComponentProps<typeof DialogFooter>;
  content?: ReactNode;
  contentProps?: ComponentProps<typeof DialogContent>;
  afterClose?: () => void;
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  title,
  titleProps,
  description,
  descriptionProps,
  footer,
  footerProps,
  content,
  contentProps,
  children,
  open,
  afterClose,
  onOpenChange,
  ...restProps
}) => {
  const [innerOpen, setInnerOpen] = useState(open || false);

  useEffect(() => {
    setInnerOpen(open || false);
  }, [open]);

  return (
    <Dialog
      open={innerOpen}
      onOpenChange={(op) => {
        setInnerOpen(op);
        onOpenChange?.(op);
      }}
      {...restProps}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogAnimateContent
        {...contentProps}
        open={innerOpen}
        className={cn(
          'max-h-screen grid-rows-[auto_1fr_auto] gap-0 py-3 px-0',
          contentProps?.className
        )}
        onExitComplete={afterClose}
      >
        <DialogHeader className="px-6 py-3">
          {title && <DialogTitle {...titleProps}>{title}</DialogTitle>}
          {description && (
            <DialogDescription {...descriptionProps}>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="overflow-auto px-6 py-3">{content}</div>
        {footer && (
          <DialogFooter
            {...footerProps}
            className={cn('px-6 py-3 space-x-2', footerProps?.className)}
          >
            {footer}
          </DialogFooter>
        )}
      </DialogAnimateContent>
    </Dialog>
  );
};
