import React, { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { DialogProps } from '@radix-ui/react-dialog';
import { cn } from '@easy-shadcn/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

export interface ModalProps extends DialogProps {
  title?: ReactNode;
  titleProps?: ComponentProps<typeof DialogTitle>;
  description?: ReactNode;
  descriptionProps?: ComponentProps<typeof DialogDescription>;
  footer?: ReactNode;
  footerProps?: ComponentProps<typeof DialogFooter>;
  content?: ReactNode;
  contentProps?: ComponentProps<typeof DialogContent>;
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
  ...resetProps
}) => {
  return (
    <Dialog {...resetProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        {...contentProps}
        className={cn('max-h-screen grid-rows-[auto_1fr_auto] p-0 py-6', contentProps?.className)}
      >
        <DialogHeader className="px-6">
          {title && <DialogTitle {...titleProps}>{title}</DialogTitle>}
          {description && (
            <DialogDescription {...descriptionProps}>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="overflow-auto px-6">{content}</div>
        {footer && (
          <DialogFooter {...footerProps} className={cn('px-6', footerProps?.className)}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
