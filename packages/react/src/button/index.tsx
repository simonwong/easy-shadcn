import React, { MouseEvent, MouseEventHandler, ReactNode, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@easy-shadcn/utils';
import {
  Button as InternalButton,
  ButtonProps as InternalButtonProps,
} from '../../components/ui/button';

export interface ButtonProps extends Omit<InternalButtonProps, 'onClick'> {
  onClick?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void | Promise<void>;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { icon, iconPosition, loading, disabled, onClick, children, size, className, ...resetProps },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
      if (onClick) {
        const clickPromise = onClick(e);

        if (clickPromise instanceof Promise) {
          setIsLoading(true);
          clickPromise
            .catch(() => {})
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    };

    const innerLoading = loading || isLoading;

    let iconNode: ReactNode = null;
    let content: ReactNode = null;

    if (size === 'icon') {
      // icon without icon
      iconNode = innerLoading ? <Loader2 className="animate-spin" /> : children;
    } else {
      iconNode = innerLoading ? <Loader2 className="animate-spin" /> : icon;
      content = children;
    }

    return (
      <InternalButton
        ref={ref}
        {...resetProps}
        size={size}
        disabled={innerLoading || disabled}
        onClick={handleClick}
        className={cn(
          iconPosition === 'end' && 'flex-row-reverse',
          '[&_svg]:size-[1em]',
          className
        )}
      >
        {iconNode ? (
          <span>
            <span role="img" className="inline-flex items-center align-[-0.125em]">
              {iconNode}
            </span>
          </span>
        ) : null}
        {content ? <span>{content}</span> : null}
      </InternalButton>
    );
  }
);

Button.displayName = 'Button';
