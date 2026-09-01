"use client";

import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
  Avatar as AvatarRoot,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AvatarRootProps = ComponentProps<typeof AvatarRoot>;
type AvatarImageProps = ComponentProps<typeof AvatarImage>;

interface AvatarOwnedRootProps {
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-size"?: never;
  "data-slot"?: never;
  render?: never;
}

export interface AvatarProps
  extends Omit<AvatarRootProps, "className" | keyof AvatarOwnedRootProps>,
    AvatarOwnedRootProps {
  /** Alternative text for an informative image. Defaults to an empty string. */
  alt?: AvatarImageProps["alt"];
  /** Caller-owned content rendered through AvatarBadge. */
  badge?: ReactNode;
  /** Class override for AvatarBadge. */
  badgeClassName?: ClassValue;
  /** Class override for the Avatar root. */
  className?: ClassValue;
  /** Required caller-owned content rendered through AvatarFallback. */
  fallback: ReactNode;
  /** Class override for AvatarFallback. */
  fallbackClassName?: ClassValue;
  /** Class override for AvatarImage. */
  imageClassName?: ClassValue;
  /** Optional image source. Undefined and empty strings use the fallback path. */
  src?: AvatarImageProps["src"];
}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const Avatar = ({
  children: _ignoredChildren,
  "data-size": _ignoredDataSize,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  src,
  alt = "",
  fallback,
  fallbackClassName,
  badge,
  badgeClassName,
  imageClassName,
  className,
  render: _ignoredRender,
  ...rootProps
}: AvatarProps) => (
  <AvatarRoot className={cn(className)} {...rootProps}>
    <AvatarImage
      alt={alt}
      className={cn(imageClassName)}
      src={src || undefined}
    />
    {hasNode(fallback) ? (
      <AvatarFallback className={cn(fallbackClassName)}>
        {fallback}
      </AvatarFallback>
    ) : null}
    {hasNode(badge) ? (
      <AvatarBadge className={cn(badgeClassName)}>{badge}</AvatarBadge>
    ) : null}
  </AvatarRoot>
);

export default Avatar;
