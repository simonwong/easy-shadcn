"use client";

import type { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { ClassValue } from "clsx";
import type { ReactElement, ReactNode } from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemPrimitive,
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  inset?: boolean;
  itemClassName?: ClassValue;
  onClick?: MenuPrimitive.Item.Props["onClick"];
  shortcut?: ReactNode;
  value: string;
  variant?: "default" | "destructive";
}

export interface DropdownMenuProps
  extends Pick<MenuPrimitive.Positioner.Props, "align" | "side"> {
  contentClassName?: ClassValue;
  defaultOpen?: boolean;
  disabled?: boolean;
  itemClassName?: ClassValue;
  items: DropdownMenuItem[];
  onOpenChange?: (
    open: boolean,
    eventDetails: MenuPrimitive.Root.ChangeEventDetails
  ) => void;
  open?: boolean;
  shortcutClassName?: ClassValue;
  sideOffset?: number;
  trigger: ReactElement;
}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const DropdownMenu = ({
  align = "start",
  defaultOpen,
  disabled = false,
  items,
  onOpenChange,
  open,
  side = "bottom",
  sideOffset = 4,
  shortcutClassName,
  trigger,
  contentClassName,
  itemClassName,
}: DropdownMenuProps) => (
  <DropdownMenuRoot
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    open={open}
  >
    <DropdownMenuTrigger disabled={disabled} render={trigger} />
    <DropdownMenuContent
      align={align}
      className={cn(contentClassName)}
      side={side}
      sideOffset={sideOffset}
    >
      {items.map((item) => (
        <DropdownMenuItemPrimitive
          className={cn(itemClassName, item.itemClassName)}
          disabled={item.disabled ?? false}
          inset={item.inset}
          key={item.value}
          onClick={item.onClick}
          variant={item.variant ?? "default"}
        >
          {hasNode(item.icon) ? (
            <span aria-hidden="true" data-slot="dropdown-menu-item-icon">
              {item.icon}
            </span>
          ) : null}
          {item.content}
          {hasNode(item.shortcut) ? (
            <DropdownMenuShortcut
              aria-hidden="true"
              className={cn(shortcutClassName)}
            >
              {item.shortcut}
            </DropdownMenuShortcut>
          ) : null}
        </DropdownMenuItemPrimitive>
      ))}
    </DropdownMenuContent>
  </DropdownMenuRoot>
);

export default DropdownMenu;
