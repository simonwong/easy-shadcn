import React, { MouseEvent, MouseEventHandler, ReactNode, useState } from 'react';
import { cn } from '@easy-shadcn/utils';
import {
  Button as InternalButton,
  ButtonProps as InternalButtonProps,
} from '../../components/ui/button';

const LoadingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

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
      iconNode = innerLoading ? <LoadingIcon className="animate-spin" /> : children;
    } else {
      iconNode = innerLoading ? <LoadingIcon className="animate-spin" /> : icon;
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
        {content ? <span className="truncate">{content}</span> : null}
      </InternalButton>
    );
  }
);

Button.displayName = 'Button';
