import React, { ComponentProps, ReactNode, useState } from "react";
import { cn } from "@easy-shadcn/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogOverlay,
} from "../../components/ui/alert-dialog";
import { Root } from "@radix-ui/react-alert-dialog"
import { Button} from "../button";

export interface AlertModalProps extends ComponentProps<typeof Root> {
  title?: ReactNode;
  content?: ReactNode;
  contentProps?: ComponentProps<typeof AlertDialogContent>;
  overlayProps?: ComponentProps<typeof AlertDialogOverlay>;
  cancelText?: ReactNode;
  onCancel?: () => void | Promise<void>;
  cancelProps?: ComponentProps<typeof AlertDialogCancel>;
  confirmText?: ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmProps?: ComponentProps<typeof AlertDialogCancel>;
  onClose?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  title,
  content,
  contentProps,
  overlayProps,
  children,
  cancelText = 'Cancel',
  onCancel,
  cancelProps,
  confirmText = 'Confirm',
  onConfirm,
  confirmProps,
  onClose,
  onOpenChange,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    onClose?.()
  };

  return (
    <AlertDialog
      onOpenChange={(op) => {
        setOpen(op);
        onOpenChange?.(op)
        if (op === false) {
          handleClose();
        }
      }}
      open={open}
      {...props}
    >
      {children && (<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>)}
      <AlertDialogContent
        overlayProps={overlayProps}
        {...contentProps}
      >
        {
          (title || content) && (
            <AlertDialogHeader className="w-full overflow-auto whitespace-break-spaces">
              {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
              {content && (<AlertDialogDescription>{content}</AlertDialogDescription>)}
            </AlertDialogHeader>
          )
        }
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={async () => {
              await onCancel?.()
              handleClose();
            }}
            className={cn("mt-2 sm:mt-0", cancelProps?.className)}
            {...cancelProps}
          >{cancelText}</Button>
          <Button
            variant="default"
            onClick={async () => {
              await onConfirm?.()
              handleClose();
            }}
            {...confirmProps}
          >{confirmText}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
