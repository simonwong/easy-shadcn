'use client';

import type { DialogProps } from '@radix-ui/react-dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ClassValue } from 'class-variance-authority/types';
import { XIcon } from 'lucide-react';
import type React from 'react';
import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps extends Omit<DialogProps, 'children'> {
  // Modal ClassName
  className?: ClassValue;
  // Content ClassName
  contentClassName?: ClassValue;
  // Content
  children?: ReactNode;
  // Title
  title?: ReactNode;
  // Title ClassName
  titleClassName?: ClassValue;
  // Description
  description?: ReactNode;
  // Description ClassName
  descriptionClassName?: ClassValue;
  // Trigger
  trigger?: ReactNode;
  // Footer
  footer?: ReactNode;
  // Footer ClassName
  footerClassName?: ClassValue;
  // Show Close Button
  showCloseButton?: boolean;
  // After Close
  afterClose?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  className,
  contentClassName,
  title,
  titleClassName,
  description,
  descriptionClassName,
  footer,
  footerClassName,
  trigger,
  children,
  open,
  afterClose,
  onOpenChange,
  showCloseButton = true,
  ...restProps
}) => {
  const [innerOpen, setInnerOpen] = useState(open);

  useEffect(() => {
    setInnerOpen(open);
  }, [open]);

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      onOpenChange={(op) => {
        setInnerOpen(op);
        onOpenChange?.(op);
      }}
      open={innerOpen}
      {...restProps}
    >
      {trigger && (
        <DialogPrimitive.Trigger asChild data-slot="dialog-trigger">
          {trigger}
        </DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal data-slot="dialog-portal">
        <DialogPrimitive.Overlay
          className={cn(
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in'
          )}
          data-slot="dialog-overlay"
        />
        <DialogPrimitive.Content
          className={cn(
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background py-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg',
            className
          )}
          data-slot="dialog-content"
        >
          <div
            className={cn('flex flex-col gap-2 px-6 text-center sm:text-left')}
            data-slot="dialog-header"
          >
            {title && (
              <DialogPrimitive.Title
                className={cn('font-semibold text-lg leading-none')}
                data-slot="dialog-title"
              >
                {title}
              </DialogPrimitive.Title>
            )}
            {description && (
              <DialogPrimitive.Description
                className={cn(
                  'text-muted-foreground text-sm',
                  descriptionClassName
                )}
                data-slot="dialog-description"
              >
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <div className={cn('overflow-auto px-6', contentClassName)}>
            {children}
          </div>
          {footer && (
            <div
              className={cn(
                'flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end',
                footerClassName
              )}
              data-slot="dialog-footer"
            >
              {footer}
            </div>
          )}
          {showCloseButton && (
            <DialogPrimitive.Close
              className="absolute top-4 right-4 cursor-pointer rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
              data-slot="dialog-close"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
