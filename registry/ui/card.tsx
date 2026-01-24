import { cva } from "class-variance-authority";
import type React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      size: {
        sm: "gap-3 py-3",
        default: "gap-6 py-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const cardElementVariants = cva("", {
  variants: {
    element: {
      header:
        "@container/card-header flex items-center justify-between gap-1.5",
      content: "",
      footer: "flex items-center",
    },
    size: {
      sm: "",
      default: "",
    },
    hasDivider: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { element: "header", size: "sm", class: "px-3" },
    { element: "header", size: "default", class: "px-6" },
    { element: "header", size: "sm", hasDivider: true, class: "border-b pb-3" },
    {
      element: "header",
      size: "default",
      hasDivider: true,
      class: "border-b pb-6",
    },
    { element: "content", size: "sm", class: "px-3" },
    { element: "content", size: "default", class: "px-6" },
    { element: "footer", size: "sm", class: "px-3" },
    { element: "footer", size: "default", class: "px-6" },

    { element: "footer", size: "sm", hasDivider: true, class: "border-t pt-3" },
    {
      element: "footer",
      size: "default",
      hasDivider: true,
      class: "border-t pt-6",
    },
  ],
  defaultVariants: {
    size: "default",
    hasDivider: false,
  },
});

export interface CardProps extends Omit<React.ComponentProps<"div">, "title"> {
  title?: ReactNode;
  titleClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  action?: ReactNode;
  actionClassName?: string;
  contentClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  dividers?: boolean | { header?: boolean; footer?: boolean };
  size?: "sm" | "default";
}

export const Card: React.FC<CardProps> = ({
  title,
  titleClassName,
  description,
  descriptionClassName,
  action,
  actionClassName,
  contentClassName,
  footer,
  footerClassName,
  children,
  className,
  dividers,
  size,
  ...resetProps
}) => {
  const showHeaderDivider =
    typeof dividers === "boolean" ? dividers : dividers?.header;
  const showFooterDivider =
    typeof dividers === "boolean" ? dividers : dividers?.footer;

  return (
    <div
      {...resetProps}
      className={cn(cardVariants({ size }), className)}
      data-slot="card"
    >
      {(title || description || action) && (
        <div
          className={cn(
            cardElementVariants({
              element: "header",
              size,
              hasDivider: showHeaderDivider,
            })
          )}
          data-slot="card-header"
        >
          <div>
            {title && (
              <div
                className={cn("font-semibold leading-none", titleClassName)}
                data-slot="card-title"
              >
                {title}
              </div>
            )}
            {description && (
              <div
                className={cn(
                  "text-muted-foreground text-sm",
                  descriptionClassName
                )}
                data-slot="card-description"
              >
                {description}
              </div>
            )}
          </div>
          {action && (
            <div
              className={cn("self-start justify-self-end", actionClassName)}
              data-slot="card-action"
            >
              {action}
            </div>
          )}
        </div>
      )}
      {children && (
        <div
          className={cn(
            cardElementVariants({
              element: "content",
              size,
            }),
            contentClassName
          )}
          data-slot="card-content"
        >
          {children}
        </div>
      )}
      {footer && (
        <div
          className={cn(
            cardElementVariants({
              element: "footer",
              size,
              hasDivider: showFooterDivider,
            }),
            footerClassName
          )}
          data-slot="card-footer"
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
