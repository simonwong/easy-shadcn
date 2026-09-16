"use client";

import type { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { ClassValue } from "clsx";
import type { ReactNode, Ref } from "react";
import {
  MenubarItem as ActionItem,
  MenubarCheckboxItem as CheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  Menubar as MenubarRoot,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

interface ItemContent {
  /** Non-interactive content providing a meaningful accessible name. */
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  inset?: boolean;
  itemClassName?: ClassValue;
  /** Display only; does not register a keyboard shortcut. */
  shortcut?: ReactNode;
}

export interface MenubarActionItem extends ItemContent {
  key: string;
  onClick?: MenuPrimitive.Item.Props["onClick"];
  type?: "item";
  variant?: "default" | "destructive";
}

export interface MenubarCheckboxItem extends ItemContent {
  /** Controlled setting. Store it outside the popup to preserve it on close. */
  checked: boolean;
  key: string;
  onCheckedChange?: MenuPrimitive.CheckboxItem.Props["onCheckedChange"];
  type: "checkbox";
}

export interface MenubarRadioOption extends ItemContent {
  value: string;
}

export interface MenubarRadioGroupItem {
  /** Non-interactive group label. */
  content: ReactNode;
  disabled?: boolean;
  items: MenubarRadioOption[];
  key: string;
  labelClassName?: ClassValue;
  onValueChange?: (
    value: string,
    details: MenuPrimitive.RadioGroup.ChangeEventDetails
  ) => void;
  type: "radio-group";
  /** Controlled setting; use an empty string for no selected option. */
  value: string;
}

export interface MenubarSubmenuItem extends Omit<ItemContent, "shortcut"> {
  contentClassName?: ClassValue;
  items: MenubarItem[];
  key: string;
  type: "submenu";
}

export interface MenubarGroupItem {
  content: ReactNode;
  items: MenubarItem[];
  key: string;
  labelClassName?: ClassValue;
  type: "group";
}

export interface MenubarSeparatorItem {
  key: string;
  type: "separator";
}

export type MenubarItem =
  | MenubarActionItem
  | MenubarCheckboxItem
  | MenubarRadioGroupItem
  | MenubarSubmenuItem
  | MenubarGroupItem
  | MenubarSeparatorItem;

export interface MenubarMenuItem {
  contentClassName?: ClassValue;
  disabled?: boolean;
  items: MenubarItem[];
  key: string;
  /** Non-interactive content providing a meaningful accessible name. */
  trigger: ReactNode;
  triggerClassName?: ClassValue;
}

export interface MenubarProps {
  "aria-label"?: string;
  className?: ClassValue;
  contentClassName?: ClassValue;
  disabled?: boolean;
  itemClassName?: ClassValue;
  items: MenubarMenuItem[];
  ref?: Ref<HTMLDivElement>;
  triggerClassName?: ClassValue;
}

function ItemLabel({ content, icon, shortcut }: ItemContent) {
  return (
    <>
      {icon == null ? null : <span aria-hidden="true">{icon}</span>}
      {content}
      {shortcut == null ? null : (
        <MenubarShortcut aria-hidden="true">{shortcut}</MenubarShortcut>
      )}
    </>
  );
}

interface ItemListProps {
  contentClassName?: ClassValue;
  itemClassName?: ClassValue;
  items: MenubarItem[];
}

function ItemList({ items, itemClassName, contentClassName }: ItemListProps) {
  return items.map((item) => {
    switch (item.type) {
      case "separator":
        return <MenubarSeparator key={item.key} />;
      case "group":
        return (
          <MenubarGroup key={item.key}>
            <MenubarLabel className={cn(item.labelClassName)}>
              {item.content}
            </MenubarLabel>
            <ItemList
              contentClassName={contentClassName}
              itemClassName={itemClassName}
              items={item.items}
            />
          </MenubarGroup>
        );
      case "radio-group":
        return (
          <MenubarGroup key={item.key}>
            <MenubarLabel className={cn(item.labelClassName)}>
              {item.content}
            </MenubarLabel>
            <MenubarRadioGroup
              disabled={item.disabled}
              onValueChange={item.onValueChange}
              value={item.value}
            >
              {item.items.map((option) => (
                <MenubarRadioItem
                  className={cn(itemClassName, option.itemClassName)}
                  closeOnClick={false}
                  disabled={option.disabled}
                  inset={option.inset}
                  key={option.value}
                  value={option.value}
                >
                  <ItemLabel
                    content={option.content}
                    icon={option.icon}
                    shortcut={option.shortcut}
                  />
                </MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
          </MenubarGroup>
        );
      case "submenu":
        return (
          <MenubarSub key={item.key}>
            <MenubarSubTrigger
              className={cn(itemClassName, item.itemClassName)}
              disabled={item.disabled}
              inset={item.inset}
            >
              <ItemLabel content={item.content} icon={item.icon} />
            </MenubarSubTrigger>
            <MenubarSubContent
              className={cn(contentClassName, item.contentClassName)}
            >
              <ItemList
                contentClassName={contentClassName}
                itemClassName={itemClassName}
                items={item.items}
              />
            </MenubarSubContent>
          </MenubarSub>
        );
      case "checkbox":
        return (
          <CheckboxItem
            checked={item.checked}
            className={cn(itemClassName, item.itemClassName)}
            closeOnClick={false}
            disabled={item.disabled}
            inset={item.inset}
            key={item.key}
            onCheckedChange={item.onCheckedChange}
          >
            <ItemLabel
              content={item.content}
              icon={item.icon}
              shortcut={item.shortcut}
            />
          </CheckboxItem>
        );
      default:
        return (
          <ActionItem
            className={cn(itemClassName, item.itemClassName)}
            closeOnClick
            disabled={item.disabled}
            inset={item.inset}
            key={item.key}
            onClick={item.onClick}
            variant={item.variant}
          >
            <ItemLabel
              content={item.content}
              icon={item.icon}
              shortcut={item.shortcut}
            />
          </ActionItem>
        );
    }
  });
}

export function Menubar({
  "aria-label": ariaLabel = "Application menu",
  className,
  contentClassName,
  disabled,
  itemClassName,
  items,
  ref,
  triggerClassName,
}: MenubarProps) {
  return (
    <MenubarRoot
      aria-label={ariaLabel}
      className={cn(className)}
      disabled={disabled}
      ref={ref}
    >
      {items.map((menu) => (
        <MenubarMenu key={menu.key}>
          <MenubarTrigger
            className={cn(triggerClassName, menu.triggerClassName)}
            disabled={menu.disabled}
          >
            {menu.trigger}
          </MenubarTrigger>
          <MenubarContent
            className={cn(contentClassName, menu.contentClassName)}
          >
            <ItemList
              contentClassName={contentClassName}
              itemClassName={itemClassName}
              items={menu.items}
            />
          </MenubarContent>
        </MenubarMenu>
      ))}
    </MenubarRoot>
  );
}

export default Menubar;
