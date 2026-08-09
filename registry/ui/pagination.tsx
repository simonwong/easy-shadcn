"use client";

import type { ClassValue } from "clsx";
import type { ComponentProps, KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as PaginationRoot,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PaginationRootProps = ComponentProps<typeof PaginationRoot>;

interface PaginationSharedProps
  extends Omit<
    PaginationRootProps,
    "children" | "className" | "dangerouslySetInnerHTML" | "role"
  > {
  /** Number of pages always shown at each outer edge, capped at 100. @default 1 */
  boundaryCount?: number;
  /** Compose owns the complete generated child structure. */
  children?: never;
  /** Class override for the navigation root. */
  className?: ClassValue;
  /** Class override for PaginationContent. */
  contentClassName?: ClassValue;
  /** Raw HTML conflicts with Compose-owned descendants. */
  dangerouslySetInnerHTML?: never;
  /** The primitive slot marker is Compose-owned. */
  "data-slot"?: never;
  /** Disables every generated destination. @default false */
  disabled?: boolean;
  /** Class override for PaginationEllipsis. */
  ellipsisClassName?: ClassValue;
  /** Hides the complete landmark when the derived page count is one. */
  hideOnSinglePage?: boolean;
  /** Class override for every PaginationItem wrapper. */
  itemClassName?: ClassValue;
  /** Class override for numbered PaginationLink leaves only. */
  linkClassName?: ClassValue;
  /** Class override for PaginationNext. */
  nextClassName?: ClassValue;
  /** Positive number of items represented by each page. @default 10 */
  pageSize?: number;
  /** Class override for PaginationPrevious. */
  previousClassName?: ClassValue;
  /** The navigation landmark role is Compose-owned. */
  role?: never;
  /** Number of pages shown on each side of the current value, capped at 100. @default 1 */
  siblingCount?: number;
  /** Non-negative total number of items. */
  total: number;
}

/** Client-controlled pagination. The caller owns value and must not pass defaultValue or getPageHref. */
export interface PaginationClientControlledProps {
  /** Initial values belong only to the client-uncontrolled variant. */
  defaultValue?: never;
  /** Route hrefs belong only to the navigation variant. */
  getPageHref?: never;
  /** Receives normalized user-activated values; prop changes never emit. */
  onValueChange: (value: number) => void;
  /** Caller-owned current page. */
  value: number;
}

/** Client-uncontrolled pagination. Compose owns value after defaultValue and still reports every user change. */
export interface PaginationClientUncontrolledProps {
  /** Initial current page. @default 1 */
  defaultValue?: number;
  /** Route hrefs belong only to the navigation variant. */
  getPageHref?: never;
  /** Receives normalized user-activated values. */
  onValueChange: (value: number) => void;
  /** Controlled values belong only to the client-controlled and navigation variants. */
  value?: never;
}

/** Route-navigation pagination. Genuine links require value and must not be combined with client state callbacks. */
export interface PaginationNavigationProps {
  /** Initial client state is mutually exclusive with route navigation. */
  defaultValue?: never;
  /** Pure, deterministic, non-throwing href mapper for every rendered target page. */
  getPageHref: (page: number) => string;
  /** Client callbacks are mutually exclusive with native route navigation. */
  onValueChange?: never;
  /** Route-derived current page. */
  value: number;
}

export type PaginationProps = PaginationSharedProps &
  (
    | PaginationClientControlledProps
    | PaginationClientUncontrolledProps
    | PaginationNavigationProps
  );

const MAX_WINDOW_COUNT = 100;

const normalizeSafeInteger = (
  value: number,
  fallback: number,
  minimum: number
): number =>
  Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(minimum, Math.trunc(value)))
    : fallback;

const normalizePageSize = (value: number): number =>
  normalizeSafeInteger(value, 10, 1);

const normalizeTotal = (value: number): number =>
  normalizeSafeInteger(value, 0, 0);

const normalizeCurrent = (value: number, pageCount: number): number => {
  const integer = normalizeSafeInteger(value, 1, 1);
  return Math.min(integer, pageCount);
};

const normalizeWindowCount = (value: number): number =>
  Math.min(MAX_WINDOW_COUNT, normalizeSafeInteger(value, 1, 0));

interface PageInterval {
  end: number;
  start: number;
}

type PageRangeItem = number | "ellipsis";

const getPageRange = (
  pageCount: number,
  currentValue: number,
  boundaryCount: number,
  siblingCount: number
): PageRangeItem[] => {
  const intervals: PageInterval[] = [];

  if (boundaryCount > 0) {
    intervals.push({ end: Math.min(boundaryCount, pageCount), start: 1 });
  }

  intervals.push({
    end: Math.min(pageCount, currentValue + siblingCount),
    start: Math.max(1, currentValue - siblingCount),
  });

  if (boundaryCount > 0) {
    intervals.push({
      end: pageCount,
      start: Math.max(1, pageCount - boundaryCount + 1),
    });
  }

  intervals.sort((left, right) => left.start - right.start);

  const merged: PageInterval[] = [];
  for (const interval of intervals) {
    const previous = merged.at(-1);

    if (previous && interval.start <= previous.end + 2) {
      previous.end = Math.max(previous.end, interval.end);
    } else {
      merged.push({ ...interval });
    }
  }

  const range: PageRangeItem[] = [];
  for (const [index, interval] of merged.entries()) {
    if (index > 0) {
      range.push("ellipsis");
    }
    for (let page = interval.start; page <= interval.end; page += 1) {
      range.push(page);
    }
  }

  return range;
};

export const Pagination = ({
  boundaryCount = 1,
  children: _ignoredChildren,
  className,
  contentClassName,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  "data-slot": _ignoredDataSlot,
  defaultValue,
  disabled = false,
  ellipsisClassName,
  getPageHref,
  hideOnSinglePage = false,
  itemClassName,
  linkClassName,
  nextClassName,
  onValueChange,
  pageSize = 10,
  previousClassName,
  role: _ignoredRole,
  siblingCount = 1,
  total,
  value,
  ...rootProps
}: PaginationProps) => {
  const pageCount = Math.max(
    1,
    Math.ceil(normalizeTotal(total) / normalizePageSize(pageSize))
  );
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normalizeCurrent(defaultValue ?? 1, pageCount)
  );
  const isNavigation = typeof getPageHref === "function";
  const currentValue = normalizeCurrent(value ?? uncontrolledValue, pageCount);
  const pageRange = getPageRange(
    pageCount,
    currentValue,
    normalizeWindowCount(boundaryCount),
    normalizeWindowCount(siblingCount)
  );

  useEffect(() => {
    if (!isNavigation && value === undefined) {
      setUncontrolledValue((previousValue) =>
        normalizeCurrent(previousValue, pageCount)
      );
    }
  }, [isNavigation, pageCount, value]);

  const activate = (target: number) => {
    if (target === currentValue) {
      return;
    }

    if (value === undefined) {
      setUncontrolledValue(target);
    }
    onValueChange?.(target);
  };

  const getControlProps = (target: number, unavailable = false) => {
    const isUnavailable = disabled || unavailable;

    if (isNavigation) {
      return {
        "aria-disabled": isUnavailable ? true : undefined,
        href: isUnavailable ? undefined : getPageHref(target),
        role: "link",
        tabIndex: isUnavailable ? -1 : undefined,
      };
    }

    return {
      "aria-disabled": isUnavailable ? true : undefined,
      onClick: () => {
        if (!isUnavailable) {
          activate(target);
        }
      },
      onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!isUnavailable) {
            activate(target);
          }
        }
      },
      role: "button",
      tabIndex: isUnavailable ? -1 : 0,
    };
  };

  if (hideOnSinglePage && pageCount === 1) {
    return null;
  }

  return (
    <PaginationRoot {...rootProps} className={cn(className)}>
      <PaginationContent className={cn(contentClassName)}>
        <PaginationItem className={cn(itemClassName)}>
          <PaginationPrevious
            className={cn(previousClassName)}
            {...getControlProps(
              Math.max(1, currentValue - 1),
              currentValue === 1
            )}
          />
        </PaginationItem>

        {pageRange.map((rangeItem, index) => (
          <PaginationItem
            className={cn(itemClassName)}
            key={rangeItem === "ellipsis" ? `ellipsis-${index}` : rangeItem}
          >
            {rangeItem === "ellipsis" ? (
              <PaginationEllipsis className={cn(ellipsisClassName)} />
            ) : (
              <PaginationLink
                className={cn(linkClassName)}
                isActive={rangeItem === currentValue}
                {...getControlProps(rangeItem)}
              >
                {rangeItem}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem className={cn(itemClassName)}>
          <PaginationNext
            className={cn(nextClassName)}
            {...getControlProps(
              Math.min(pageCount, currentValue + 1),
              currentValue === pageCount
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
};

export default Pagination;
