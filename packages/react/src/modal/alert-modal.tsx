import React, { ComponentProps, ReactNode, useEffect, useState } from 'react';
import { cn } from '@easy-shadcn/utils';
import { Root } from '@radix-ui/react-alert-dialog';
import { AlertDialogAnimateContent } from '@/components/animate/alert-dialog-animate';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '../button';
import useLocale from '../locale/useLocale';

export interface AlertModalProps extends ComponentProps<typeof Root> {
  title?: ReactNode;
  content?: ReactNode;
  contentProps?: ComponentProps<typeof AlertDialogContent>;
  cancelText?: ReactNode;
  onCancel?: () => void | Promise<void>;
  cancelProps?: ComponentProps<typeof AlertDialogCancel>;
  confirmText?: ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmProps?: ComponentProps<typeof AlertDialogCancel>;
  afterClose?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  title,
  content,
  contentProps,
  children,
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
  const [innerOpen, setInnerOpen] = useState(open || false);

  const [locale] = useLocale('AlertModal');

  useEffect(() => {
    setInnerOpen(open || false);
  }, [open]);

  const handleClose = () => {
    setInnerOpen(false);
    onOpenChange?.(false);
  };

  return (
    <AlertDialog
      onOpenChange={(op) => {
        setInnerOpen(op);
        onOpenChange?.(op);
      }}
      open={innerOpen}
      {...props}
    >
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogAnimateContent open={innerOpen} onExitComplete={afterClose} {...contentProps}>
        {(title || content) && (
          <AlertDialogHeader className="w-full overflow-auto whitespace-break-spaces">
            {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
            {content && <AlertDialogDescription>{content}</AlertDialogDescription>}
          </AlertDialogHeader>
        )}
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={async () => {
              await onCancel?.();
              handleClose();
            }}
            className={cn('mt-2 sm:mt-0', cancelProps?.className)}
            {...cancelProps}
          >
            {cancelText || locale.cancelText}
          </Button>
          <Button
            variant="default"
            onClick={async () => {
              await onConfirm?.();
              handleClose();
            }}
            {...confirmProps}
          >
            {confirmText || locale.okText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogAnimateContent>
    </AlertDialog>
  );
};
