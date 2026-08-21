"use client";

import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
  CarouselContent,
  CarouselItem as CarouselItemPrimitive,
  CarouselNext,
  CarouselPrevious,
  Carousel as CarouselRoot,
  type CarouselApi as PrimitiveCarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type CarouselRootProps = ComponentProps<typeof CarouselRoot>;
type PrimitiveOptions = NonNullable<CarouselRootProps["opts"]>;
type BreakpointOptions = Omit<PrimitiveOptions, "axis" | "breakpoints">;

type CarouselName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type CarouselApi = PrimitiveCarouselApi;
export type CarouselOptions = Omit<PrimitiveOptions, "axis" | "breakpoints"> & {
  breakpoints?: Record<string, BreakpointOptions>;
};
export type CarouselPlugins = NonNullable<CarouselRootProps["plugins"]>;
export type CarouselPlugin = CarouselPlugins[number];

export interface CarouselItem {
  /** Caller-owned slide content. */
  item: ReactNode;
  /** Class override for this CarouselItem, merged after the global itemClassName. */
  itemClassName?: ClassValue;
  /** Stable unique React key; not forwarded to Embla or the DOM. */
  value: string;
}

type CarouselSharedProps = Omit<
  CarouselRootProps,
  | "aria-roledescription"
  | "children"
  | "className"
  | "dangerouslySetInnerHTML"
  | "data-slot"
  | "defaultValue"
  | "onKeyDownCapture"
  | "onSelect"
  | "opts"
  | "plugins"
  | "role"
  | "value"
> & {
  /** Compose owns the complete generated child structure. */
  children?: never;
  /** Class override for the carousel root. */
  className?: ClassValue;
  /** Class override for the CarouselContent flex track, not its viewport. */
  contentClassName?: ClassValue;
  /** Raw HTML conflicts with Compose-owned descendants. */
  dangerouslySetInnerHTML?: never;
  /** The primitive slot marker is Compose-owned. */
  "data-slot"?: never;
  /** Carousel does not expose a controlled or uncontrolled selection model. */
  defaultValue?: never;
  /** Class override for every CarouselItem. */
  itemClassName?: ClassValue;
  /** Homogeneous slides rendered in array order. */
  items: CarouselItem[];
  /** Class override for CarouselNext. */
  nextClassName?: ClassValue;
  /** Compose owns primitive keyboard navigation. */
  onKeyDownCapture?: never;
  /** Embla owns selection; use setApi for selection events. */
  onSelect?: never;
  /** Embla owns selection; use setApi for selection events. */
  onValueChange?: never;
  /** Embla options excluding every axis override. */
  opts?: CarouselOptions;
  /** Embla plugins delegated unchanged to the primitive. */
  plugins?: CarouselPlugins;
  /** Class override for CarouselPrevious. */
  previousClassName?: ClassValue;
  /** The carousel landmark role is Compose-owned. */
  role?: never;
  /** Carousel does not expose a controlled or uncontrolled selection model. */
  value?: never;
  /** The primitive carousel role description is Compose-owned. */
  "aria-roledescription"?: never;
};

export type CarouselProps = CarouselSharedProps & CarouselName;

const sanitizeOptions = (
  options: CarouselOptions | undefined
): CarouselOptions | undefined => {
  if (!options) {
    return;
  }

  const {
    axis: _ignoredAxis,
    breakpoints,
    ...safeOptions
  } = options as CarouselOptions & { axis?: unknown };

  if (!breakpoints) {
    return safeOptions;
  }

  const safeBreakpoints = Object.fromEntries(
    Object.entries(breakpoints).map(([query, breakpointOptions]) => {
      const {
        axis: _ignoredBreakpointAxis,
        breakpoints: _ignoredNestedBreakpoints,
        ...safeBreakpointOptions
      } = breakpointOptions as BreakpointOptions & {
        axis?: unknown;
        breakpoints?: unknown;
      };

      return [query, safeBreakpointOptions];
    })
  );

  return { ...safeOptions, breakpoints: safeBreakpoints };
};

export const Carousel = ({
  "aria-roledescription": _ignoredRoleDescription,
  children: _ignoredChildren,
  className,
  contentClassName,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  "data-slot": _ignoredDataSlot,
  defaultValue: _ignoredDefaultValue,
  itemClassName,
  items,
  nextClassName,
  onKeyDownCapture: _ignoredKeyDownCapture,
  onSelect: _ignoredOnSelect,
  onValueChange: _ignoredOnValueChange,
  opts,
  orientation = "horizontal",
  plugins,
  previousClassName,
  role: _ignoredRole,
  value: _ignoredValue,
  ...rootProps
}: CarouselProps) => {
  if (items.length === 0) {
    return null;
  }

  const showControls = items.length > 1;
  const horizontalControlClassName =
    orientation === "horizontal" ? "rtl:rotate-180" : undefined;

  return (
    <CarouselRoot
      className={cn(className)}
      opts={sanitizeOptions(opts)}
      orientation={orientation}
      plugins={plugins}
      {...rootProps}
    >
      <CarouselContent className={cn(contentClassName)}>
        {items.map(
          ({ item, itemClassName: localItemClassName, value }, index) => (
            <CarouselItemPrimitive
              aria-label={`${index + 1} of ${items.length}`}
              className={cn(itemClassName, localItemClassName)}
              key={value}
            >
              {item}
            </CarouselItemPrimitive>
          )
        )}
      </CarouselContent>
      {showControls && (
        <>
          <CarouselPrevious
            className={cn(horizontalControlClassName, previousClassName)}
          />
          <CarouselNext
            className={cn(horizontalControlClassName, nextClassName)}
          />
        </>
      )}
    </CarouselRoot>
  );
};

export default Carousel;
