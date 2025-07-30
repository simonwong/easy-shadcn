import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import React, {
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const LoadingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonProps = {
  onClick?: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void | Promise<void>;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
} & React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button: React.FC<ButtonProps> = ({
  icon,
  iconPosition,
  loading,
  disabled,
  onClick,
  children,
  size,
  className,
  variant,
  asChild,
  ...resetProps
}) => {
  const Comp = asChild ? Slot : 'button';
  const [isLoading, setIsLoading] = useState(false);
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onClick) {
      const clickPromise = onClick(e);

      if (clickPromise instanceof Promise) {
        setIsLoading(true);
        clickPromise
          .catch(() => {
            // do nothing
          })
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
    iconNode = innerLoading ? (
      <LoadingIcon className="animate-spin" />
    ) : (
      children
    );
  } else {
    iconNode = innerLoading ? <LoadingIcon className="animate-spin" /> : icon;
    content = children;
  }

  return (
    <Comp
      {...resetProps}
      className={cn(
        buttonVariants({ variant, size, className }),
        iconPosition === 'end' && 'flex-row-reverse',
        '[&_svg]:size-[1em]',
        className
      )}
      data-slot="button"
      disabled={innerLoading || disabled}
      onClick={handleClick}
    >
      {iconNode ? (
        <span className="inline-flex items-center align-[-0.125em]" role="img">
          {iconNode}
        </span>
      ) : null}
      {content ? <span className="truncate">{content}</span> : null}
    </Comp>
  );
};

Button.displayName = 'Button';
