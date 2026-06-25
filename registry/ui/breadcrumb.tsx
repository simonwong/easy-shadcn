import { type ComponentProps, Fragment, type ReactNode } from "react";
import {
  BreadcrumbEllipsis,
  BreadcrumbItem as BreadcrumbItemPrimitive,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  current?: boolean;
  href?: string;
  label: ReactNode;
}

export interface BreadcrumbProps
  extends Omit<ComponentProps<"nav">, "children"> {
  itemClassName?: string;
  items: BreadcrumbItem[];
  linkClassName?: string;
  listClassName?: string;
  maxItems?: number;
  pageClassName?: string;
  separator?: ReactNode;
  separatorClassName?: string;
}

interface Entry {
  index: number;
  item: BreadcrumbItem;
  key: string;
}

const ELLIPSIS_KEY = "__ellipsis__";

// Prefix with the original index so repeated hrefs / labels still yield unique
// React keys. The key is a derived string (not the bare index), so it satisfies
// the noArrayIndexKey lint rule while staying stable for a given item position.
const toKey = (item: BreadcrumbItem, index: number): string => {
  if (item.href !== undefined) {
    return `${index}-${item.href}`;
  }
  if (typeof item.label === "string") {
    return `${index}-${item.label}`;
  }
  return `breadcrumb-${index}`;
};

export const Breadcrumb = ({
  items,
  separator,
  maxItems,
  listClassName,
  itemClassName,
  linkClassName,
  pageClassName,
  separatorClassName,
  ...navProps
}: BreadcrumbProps) => {
  const lastIndex = items.length - 1;
  const anyExplicitCurrent = items.some((item) => item.current === true);

  const entries: Entry[] = items.map((item, index) => ({
    index,
    item,
    key: toKey(item, index),
  }));

  const collapsed = maxItems !== undefined && items.length > maxItems;

  // When collapsed, keep the first item, an ellipsis, and the last `maxItems - 1`
  // items. tailStart is clamped to 1 so the head and tail can never overlap and the
  // current page (the last item) is always shown.
  const tailCount = maxItems === undefined ? 0 : Math.max(1, maxItems - 1);
  const tailStart = Math.max(items.length - tailCount, 1);

  const nodes: (Entry | { key: string })[] = collapsed
    ? [
        ...entries.slice(0, 1),
        { key: ELLIPSIS_KEY },
        ...entries.slice(tailStart),
      ]
    : entries;

  const renderEntry = ({ item, index }: Entry) => {
    const isCurrent =
      item.current ?? (!anyExplicitCurrent && index === lastIndex);

    if (isCurrent) {
      return (
        <BreadcrumbPage className={cn(pageClassName)}>
          {item.label}
        </BreadcrumbPage>
      );
    }
    if (item.href !== undefined) {
      return (
        <BreadcrumbLink className={cn(linkClassName)} href={item.href}>
          {item.label}
        </BreadcrumbLink>
      );
    }
    return item.label;
  };

  return (
    <BreadcrumbRoot {...navProps}>
      <BreadcrumbList className={cn(listClassName)}>
        {nodes.map((node, position) => (
          <Fragment key={node.key}>
            <BreadcrumbItemPrimitive className={cn(itemClassName)}>
              {node.key === ELLIPSIS_KEY ? (
                <BreadcrumbEllipsis />
              ) : (
                renderEntry(node as Entry)
              )}
            </BreadcrumbItemPrimitive>
            {position < nodes.length - 1 && (
              <BreadcrumbSeparator className={cn(separatorClassName)}>
                {separator}
              </BreadcrumbSeparator>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
};

export default Breadcrumb;
