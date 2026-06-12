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
  headerClassName?: string;
  size?: "default" | "sm";
  title?: ReactNode;
  titleClassName?: string;
}

// Mirrors React's own rendering rules: null/undefined/boolean render nothing,
// but valid falsy nodes like 0 and "" must not be swallowed.
const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

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
  headerClassName,
  children,
  className,
  dividers,
  size,
  ...restProps
}) => {
  const { header: showHeaderDivider, footer: showFooterDivider } =
    typeof dividers === "boolean"
      ? { header: dividers, footer: dividers }
      : {
          header: dividers?.header ?? false,
          footer: dividers?.footer ?? false,
        };

  return (
    <CardBase className={className} size={size} {...restProps}>
      {(hasNode(title) || hasNode(description) || hasNode(action)) && (
        <CardHeader
          className={cn(showHeaderDivider && "border-b", headerClassName)}
        >
          {hasNode(title) && (
            <CardTitle className={titleClassName}>{title}</CardTitle>
          )}
          {hasNode(description) && (
            <CardDescription className={descriptionClassName}>
              {description}
            </CardDescription>
          )}
          {hasNode(action) && (
            <CardAction className={actionClassName}>{action}</CardAction>
          )}
        </CardHeader>
      )}
      {hasNode(children) && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}
      {hasNode(footer) && (
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
