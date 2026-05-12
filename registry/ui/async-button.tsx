"use client";

import type React from "react";
import type { MouseEvent, MouseEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDelayLoading } from "@/registry/hooks/use-delay-loading";

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
  e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
) => void | Promise<void>;

export type AsyncButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick"
> & {
  onClick?: AsyncButtonClickHandler;
  /**
   * Controlled loading state. When provided, takes precedence over the
   * auto-managed Promise loading; pass `false` to fully suppress the spinner
   * even while an async `onClick` is in flight.
   */
  loading?: boolean;
  /**
   * Icon rendered before `children`. While loading, this slot is replaced by
   * the spinner (taking precedence over `endIcon`).
   */
  startIcon?: React.ReactNode;
  /**
   * Icon rendered after `children`. While loading and `startIcon` is absent,
   * this slot is replaced by the spinner.
   */
  endIcon?: React.ReactNode;
};

export const AsyncButton: React.FC<AsyncButtonProps> = ({
  loading,
  disabled,
  onClick,
  children,
  className,
  startIcon,
  endIcon,
  size,
  ...restProps
}) => {
  const [innerLoading, setLoading] = useDelayLoading({ loading });

  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    if (!onClick) {
      return;
    }
    const result = onClick(e as MouseEvent<HTMLButtonElement>);
    if (result instanceof Promise) {
      setLoading(true);
      result
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  let spinnerSlot: "start" | "end" | "children" | "overlay" | null = null;
  if (innerLoading) {
    if (size === "icon") {
      spinnerSlot = "children";
    } else if (startIcon) {
      spinnerSlot = "start";
    } else if (endIcon) {
      spinnerSlot = "end";
    } else {
      spinnerSlot = "overlay";
    }
  }

  const spinner = <LoadingIcon className="animate-spin" />;

  return (
    <Button
      {...restProps}
      aria-busy={innerLoading}
      className={cn(
        spinnerSlot === "overlay" && "relative disabled:opacity-100",
        className
      )}
      disabled={innerLoading || disabled}
      onClick={handleClick}
      size={size}
    >
      {spinnerSlot === "start" ? spinner : startIcon}
      {spinnerSlot === "children" ? spinner : children}
      {spinnerSlot === "end" ? spinner : endIcon}
      {spinnerSlot === "overlay" && (
        <>
          <span className="absolute inset-0 rounded-[inherit] backdrop-blur-[3px]" />
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingIcon className="size-[1.4em] animate-spin" />
          </span>
        </>
      )}
    </Button>
  );
};
