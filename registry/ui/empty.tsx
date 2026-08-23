import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  Empty as EmptyRoot,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface EmptyOwnedProps {
  children?: never;
  className?: ClassValue;
  content?: ReactNode;
  contentClassName?: ClassValue;
  dangerouslySetInnerHTML?: never;
  "data-slot"?: never;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  headerClassName?: ClassValue;
  media?: ReactNode;
  mediaClassName?: ClassValue;
  /** Applies only when media renders. */
  mediaVariant?: NonNullable<ComponentProps<typeof EmptyMedia>["variant"]>;
  title?: ReactNode;
  titleClassName?: ClassValue;
  [dataAttribute: `data-${string}`]:
    | boolean
    | null
    | number
    | string
    | undefined;
}

export interface EmptyProps
  extends Omit<ComponentProps<typeof EmptyRoot>, keyof EmptyOwnedProps>,
    EmptyOwnedProps {}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const Empty = ({
  children: _ignoredChildren,
  className,
  content,
  contentClassName,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  description,
  descriptionClassName,
  headerClassName,
  media,
  mediaClassName,
  mediaVariant,
  title,
  titleClassName,
  ...rootProps
}: EmptyProps) => {
  const hasHeader = hasNode(media) || hasNode(title) || hasNode(description);

  return (
    <EmptyRoot className={cn(className)} {...rootProps}>
      {hasHeader ? (
        <EmptyHeader className={cn(headerClassName)}>
          {hasNode(media) ? (
            <EmptyMedia className={cn(mediaClassName)} variant={mediaVariant}>
              {media}
            </EmptyMedia>
          ) : null}
          {hasNode(title) ? (
            <EmptyTitle className={cn(titleClassName)}>{title}</EmptyTitle>
          ) : null}
          {hasNode(description) ? (
            <EmptyDescription className={cn(descriptionClassName)}>
              {description}
            </EmptyDescription>
          ) : null}
        </EmptyHeader>
      ) : null}
      {hasNode(content) ? (
        <EmptyContent className={cn(contentClassName)}>{content}</EmptyContent>
      ) : null}
    </EmptyRoot>
  );
};

export default Empty;
