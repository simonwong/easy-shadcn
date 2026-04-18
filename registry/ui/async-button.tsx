"use client";

import type React from "react";
import {
  type MouseEvent,
  type MouseEventHandler,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
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

export type AsyncButtonClickHandler = (
  e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
) => void | Promise<void>;

export type AsyncButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick"
> & {
  onClick?: AsyncButtonClickHandler;
  loading?: boolean;
};

export const AsyncButton: React.FC<AsyncButtonProps> = ({
  loading,
  disabled,
  onClick,
  children,
  className,
  ...restProps
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    if (!onClick) {
      return;
    }
    const result = onClick(e as MouseEvent<HTMLButtonElement>);
    if (result instanceof Promise) {
      setIsLoading(true);
      result
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const innerLoading = loading || isLoading;

  return (
    <Button
      {...restProps}
      className={cn("relative", className)}
      disabled={innerLoading || disabled}
      onClick={handleClick}
    >
      {children}
      {innerLoading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-current/10 backdrop-blur-[1px]">
          <LoadingIcon className="size-[1em] animate-spin" />
        </span>
      )}
    </Button>
  );
};
