import React, { ComponentProps, PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import { DialogProps } from '@radix-ui/react-dialog';
import { cn } from '@easy-shadcn/utils';
import useAfterClose from './hooks/useAfterClose';
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
  ...restProps
}) => {
  useAfterClose(open, afterClose);

  return (
    <Dialog open={open} {...restProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        {...contentProps}
        className={cn(
          'max-h-screen grid-rows-[auto_1fr_auto] gap-0 py-3 px-0',
          contentProps?.className
        )}
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
      </DialogContent>
    </Dialog>
  );
};
