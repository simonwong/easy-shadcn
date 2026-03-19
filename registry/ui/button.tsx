"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import React, {
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  useState,
} from "react";
import { cn } from "@/lib/utils";

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

export type ButtonProps = {
  onClick?: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => void | Promise<void>;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
} & React.ComponentProps<"button"> &
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
  const Comp = asChild ? Slot : "button";
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

  if (size === "icon") {
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
        iconPosition === "end" && "flex-row-reverse",
        "[&_svg]:size-[1em]",
        className,
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

Button.displayName = "Button";
