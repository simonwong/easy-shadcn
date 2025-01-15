'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@easy-shadcn/utils';

const AlertDialogAnimateContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    open: boolean;
    onExitComplete?: () => void;
  }
>(({ className, children, open, onExitComplete, ...props }, ref) => (
  <AnimatePresence onExitComplete={onExitComplete}>
    {open && (
      <AlertDialogPrimitive.Portal forceMount>
        <AlertDialogPrimitive.Overlay forceMount asChild>
          <motion.div
            className={cn('fixed inset-0 z-50 bg-black/80')}
            exit={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
          />
        </AlertDialogPrimitive.Overlay>
        <AlertDialogPrimitive.Content ref={ref} forceMount asChild {...props}>
          <motion.div
            className={cn(
              'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
              className
            )}
            initial={{ opacity: 0, scale: 0.5, translateX: '-50%', translateY: '-50%' }}
            animate={{ opacity: 1, scale: 1, translateX: '-50%', translateY: '-50%' }}
            exit={{ opacity: 0, scale: 0.5, translateX: '-50%', translateY: '-50%' }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          >
            {children}
          </motion.div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    )}
  </AnimatePresence>
));
AlertDialogAnimateContent.displayName = AlertDialogPrimitive.Content.displayName;

export { AlertDialogAnimateContent };
