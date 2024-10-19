import React, { MouseEvent, MouseEventHandler, ReactNode, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button as InternalButton,
  ButtonProps as InternalButtonProps,
} from '../../components/ui/button';

export interface ButtonProps extends Omit<InternalButtonProps, 'prefix' | 'onClick'> {
  onClick?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void | Promise<void>;
  loading?: boolean;
  prefix?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ prefix, loading, disabled, onClick, children, size, ...resetProps }, ref) => {
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

    let prefixNode: ReactNode = null;
    let content: ReactNode = null;

    if (size === 'icon') {
      // icon without prefix
      content = innerLoading ? <Loader2 className="size-4 animate-spin" /> : children;
    } else {
      prefixNode = innerLoading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        prefix && <span className="mr-2">{prefix}</span>
      );
      content = children;
    }

    return (
      <InternalButton
        ref={ref}
        {...resetProps}
        size={size}
        disabled={innerLoading || disabled}
        onClick={handleClick}
      >
        {prefixNode}
        {content}
      </InternalButton>
    );
  }
);

Button.displayName = 'Button';
