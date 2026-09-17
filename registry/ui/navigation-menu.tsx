"use client";

import type { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import type { ClassValue } from "clsx";
import type { ReactNode, Ref } from "react";
import {
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenu as NavigationMenuRoot,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuItem as PrimitiveItem,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export interface NavigationMenuLinkItem {
  /** Caller-owned current-page state; independent of the expanded panel. */
  active?: boolean;
  /** Non-interactive content providing a meaningful accessible name. */
  content: ReactNode;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  href: string;
  items?: never;
  linkClassName?: ClassValue;
  rel?: string;
  target?: NavigationMenuPrimitive.Link.Props["target"];
  trigger?: never;
  /** Stable identity, unique within this list. */
  value: string;
}

export interface NavigationMenuDropdownItem {
  active?: never;
  content?: never;
  contentClassName?: ClassValue;
  href?: never;
  items: NavigationMenuLinkItem[];
  /** Non-interactive content providing a meaningful accessible name. */
  trigger: ReactNode;
  triggerClassName?: ClassValue;
  /** Stable identity used by the root's expanded-panel value. */
  value: string;
}

export type NavigationMenuItem =
  | NavigationMenuLinkItem
  | NavigationMenuDropdownItem;

export interface NavigationMenuProps {
  "aria-label"?: string;
  className?: ClassValue;
  contentClassName?: ClassValue;
  /** Initially expanded dropdown. Ignored when value is controlled. */
  defaultValue?: string | null;
  items: NavigationMenuItem[];
  linkClassName?: ClassValue;
  listClassName?: ClassValue;
  onValueChange?: (
    value: string | null,
    details: NavigationMenuPrimitive.Root.ChangeEventDetails
  ) => void;
  ref?: Ref<HTMLElement>;
  triggerClassName?: ClassValue;
  /** Expanded dropdown identity, not the current page; null closes all panels. */
  value?: string | null;
}

function LinkItem({
  item,
  className,
}: {
  className?: ClassValue;
  item: NavigationMenuLinkItem;
}) {
  return (
    <NavigationMenuLink
      active={item.active}
      className={cn(
        "min-w-0 flex-col items-start gap-1 whitespace-normal [overflow-wrap:anywhere]",
        className,
        item.linkClassName
      )}
      closeOnClick
      href={item.href}
      rel={item.rel}
      target={item.target}
    >
      <span className="font-medium">{item.content}</span>
      {item.description == null ? null : (
        <span
          className={cn(
            "text-muted-foreground text-sm",
            item.descriptionClassName
          )}
        >
          {item.description}
        </span>
      )}
    </NavigationMenuLink>
  );
}

export function NavigationMenu({
  "aria-label": ariaLabel = "Main navigation",
  className,
  contentClassName,
  defaultValue,
  items,
  linkClassName,
  listClassName,
  onValueChange,
  ref,
  triggerClassName,
  value,
}: NavigationMenuProps) {
  return (
    <NavigationMenuRoot
      aria-label={ariaLabel}
      className={cn("max-w-full flex-none justify-start", className)}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      ref={ref}
      value={value}
    >
      <NavigationMenuList
        className={cn("min-w-0 flex-wrap justify-start", listClassName)}
      >
        {items.map((item) => (
          <PrimitiveItem
            className="max-w-full"
            key={item.value}
            value={item.value}
          >
            {item.items ? (
              <>
                <NavigationMenuTrigger
                  className={cn(
                    "h-auto min-h-9 max-w-full whitespace-normal text-left [overflow-wrap:anywhere]",
                    triggerClassName,
                    item.triggerClassName
                  )}
                >
                  {item.trigger}
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={cn(
                    "h-auto max-h-[min(24rem,var(--available-height,24rem))] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto",
                    contentClassName,
                    item.contentClassName
                  )}
                >
                  <ul className="m-0 list-none p-0">
                    {item.items.map((link) => (
                      <li key={link.value}>
                        <LinkItem className={linkClassName} item={link} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <LinkItem
                className={cn(
                  navigationMenuTriggerStyle(),
                  "h-auto min-h-9 max-w-full",
                  linkClassName
                )}
                item={item}
              />
            )}
          </PrimitiveItem>
        ))}
      </NavigationMenuList>
    </NavigationMenuRoot>
  );
}

export default NavigationMenu;
