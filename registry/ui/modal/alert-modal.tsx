'use client';

import type { Root } from '@radix-ui/react-alert-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { ClassValue } from 'class-variance-authority/types';
import type React from 'react';
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import useLocale from '../../hooks/useLocale';
import { Button } from '../button';

export interface AlertModalProps
  extends Omit<ComponentProps<typeof Root>, 'children'> {
  trigger?: ReactNode;
  title?: ReactNode;
  titleClassName?: ClassValue;
  content?: ReactNode;
  contentClassName?: ClassValue;
  footer?: ReactNode;
  footerClassName?: ClassValue;
  cancelText?: ReactNode;
  onCancel?: () => void | Promise<void>;
  cancelProps?: ComponentProps<typeof Button>;
  confirmText?: ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmProps?: ComponentProps<typeof Button>;
  afterClose?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  trigger,
  title,
  titleClassName,
  content,
  contentClassName,
  footer,
  footerClassName,
  cancelText,
  onCancel,
  cancelProps,
  confirmText,
  onConfirm,
  confirmProps,
  onOpenChange,
  afterClose,
  open,
  ...props
}) => {
  const [innerOpen, setInnerOpen] = useState(open);

  const [locale] = useLocale('AlertModal');

  useEffect(() => {
    setInnerOpen(open);
  }, [open]);

  const handleClose = () => {
    setInnerOpen(false);
    onOpenChange?.(false);
  };

  return (
    <AlertDialogPrimitive.Root
      data-slot="alert-dialog"
      onOpenChange={(op) => {
        setInnerOpen(op);
        onOpenChange?.(op);
      }}
      open={innerOpen}
      {...props}
    >
      {trigger && (
        <AlertDialogPrimitive.Trigger asChild data-slot="alert-dialog-trigger">
          {trigger}
        </AlertDialogPrimitive.Trigger>
      )}
      <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal">
        <AlertDialogPrimitive.Overlay
          className={cn(
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in'
          )}
          data-slot="alert-dialog-overlay"
          {...props}
        />
        <AlertDialogPrimitive.Content
          className={cn(
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg'
          )}
          data-slot="alert-dialog-content"
        >
          <div
            className="flex flex-col gap-2 text-center sm:text-left"
            data-slot="alert-dialog-header"
          >
            {title && (
              <AlertDialogPrimitive.Title
                className={cn('font-semibold text-lg', titleClassName)}
                data-slot="alert-dialog-title"
              >
                {title}
              </AlertDialogPrimitive.Title>
            )}
            {content && (
              <AlertDialogPrimitive.Description
                className={cn(
                  'text-muted-foreground text-sm',
                  contentClassName
                )}
                data-slot="alert-dialog-description"
              >
                {content}
              </AlertDialogPrimitive.Description>
            )}
          </div>
          <div
            className={cn(
              'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
              footerClassName
            )}
            data-slot="alert-dialog-footer"
          >
            <Button
              onClick={async () => {
                await onCancel?.();
                handleClose();
              }}
              variant="outline"
              {...cancelProps}
              className={cn('mt-2 sm:mt-0', cancelProps?.className)}
            >
              {cancelText || locale.cancelText}
            </Button>
            <Button
              onClick={async () => {
                await onConfirm?.();
                handleClose();
              }}
              variant="default"
              {...confirmProps}
            >
              {confirmText || locale.okText}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};
