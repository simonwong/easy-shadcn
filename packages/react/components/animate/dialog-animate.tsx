'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@easy-shadcn/utils';

const DialogAnimateContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    open: boolean;
    onExitComplete?: () => void;
  }
>(({ className, children, open, onExitComplete, ...props }, ref) => {
  return (
    (
      <AnimatePresence onExitComplete={onExitComplete}>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay forceMount asChild {...props}>
              <motion.div
                className={cn('fixed inset-0 z-50 bg-black/80')}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content ref={ref} forceMount asChild {...props}>
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
                <DialogPrimitive.Close tabIndex={-1} className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-sm text-muted-foreground opacity-70 ring-offset-background transition-opacity hover:bg-accent hover:opacity-100  disabled:pointer-events-none">
                  <Cross2Icon className="size-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    )
  )
});
DialogAnimateContent.displayName = DialogPrimitive.Content.displayName;

export { DialogAnimateContent };
