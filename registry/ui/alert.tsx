import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
  AlertAction,
  AlertDescription,
  Alert as AlertRoot,
  AlertTitle,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AlertOwnedRootProps {
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-slot"?: never;
  role?: never;
}

export interface AlertProps
  extends Omit<
      ComponentProps<typeof AlertRoot>,
      "title" | keyof AlertOwnedRootProps
    >,
    AlertOwnedRootProps {
  action?: ReactNode;
  actionClassName?: ClassValue;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  icon?: ReactNode;
  title?: ReactNode;
  titleClassName?: ClassValue;
}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const Alert = ({
  children: _ignoredChildren,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  icon,
  title,
  titleClassName,
  description,
  descriptionClassName,
  action,
  actionClassName,
  role: _ignoredRole,
  ...rootProps
}: AlertProps) => (
  <AlertRoot {...rootProps}>
    {hasNode(icon) ? icon : null}
    {hasNode(title) ? (
      <AlertTitle className={cn(titleClassName)}>{title}</AlertTitle>
    ) : null}
    {hasNode(description) ? (
      <AlertDescription className={cn(descriptionClassName)}>
        {description}
      </AlertDescription>
    ) : null}
    {hasNode(action) ? (
      <AlertAction className={cn(actionClassName)}>{action}</AlertAction>
    ) : null}
  </AlertRoot>
);

export default Alert;
