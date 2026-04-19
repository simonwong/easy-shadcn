import type React from "react";
import type { ReactNode } from "react";
import {
  CardAction,
  Card as CardBase,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<React.ComponentProps<"div">, "title"> {
  action?: ReactNode;
  actionClassName?: string;
  contentClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  dividers?: boolean | { header?: boolean; footer?: boolean };
  footer?: ReactNode;
  footerClassName?: string;
  size?: "default" | "sm";
  title?: ReactNode;
  titleClassName?: string;
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
  ...restProps
}) => {
  const showHeaderDivider =
    typeof dividers === "boolean" ? dividers : dividers?.header;
  const showFooterDivider =
    typeof dividers === "boolean" ? dividers : dividers?.footer;

  return (
    <CardBase className={className} size={size} {...restProps}>
      {(title || description || action) && (
        <CardHeader className={cn(showHeaderDivider && "border-b")}>
          {title && <CardTitle className={titleClassName}>{title}</CardTitle>}
          {description && (
            <CardDescription className={descriptionClassName}>
              {description}
            </CardDescription>
          )}
          {action && (
            <CardAction className={actionClassName}>{action}</CardAction>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}
      {footer && (
        <CardFooter
          className={cn(
            !showFooterDivider && "border-none bg-transparent",
            footerClassName
          )}
        >
          {footer}
        </CardFooter>
      )}
    </CardBase>
  );
};

export default Card;
