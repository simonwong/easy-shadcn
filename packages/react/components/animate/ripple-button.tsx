'use client';

import * as React from 'react';
import { cn } from '@easy-shadcn/utils';
import { Ripple, RippleAction } from './ripple';
import { Button, type ButtonProps } from '../ui/button';

export type RippleButtonProps = ButtonProps;

const BlackRipple = 'rgb(0 0 0 / 0.3)';
const WhiteRipple = 'rgb(255 255 255 / 0.3)';

const getRippleColor = (variant: RippleButtonProps['variant']) => {
  if (['outline', 'ghost', 'secondary'].includes(variant || '')) {
    return BlackRipple;
  }
  return WhiteRipple;
};

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ className, children, onMouseDown, variant, ...props }, ref) => {
    const rippleRef = React.useRef<RippleAction>(null);

    return (
      <Button
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        onMouseDown={(e) => {
          onMouseDown?.(e);
          rippleRef.current?.showRipple(e);
        }}
        variant={variant}
        {...props}
      >
        <Ripple color={getRippleColor(variant)} rippleRef={rippleRef} />
        {children}
      </Button>
    );
  }
);

RippleButton.displayName = 'RippleButton';

export { RippleButton };
