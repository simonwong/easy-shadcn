"use client";

import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Sidebar as SidebarPrimitive,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger as SidebarTriggerPrimitive,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarItemMetadata {
  className?: ClassValue;
  disabled?: boolean;
  extra?: ReactNode;
  extraClassName?: ClassValue;
  icon?: ReactNode;
  iconClassName?: ClassValue;
  key: string;
  label: ReactNode;
  labelClassName?: ClassValue;
}

export interface SidebarLeafItem extends SidebarItemMetadata {
  href?: string;
  rel?: string;
  target?: string;
  type?: "item";
}

export interface SidebarSeparatorItem {
  className?: ClassValue;
  key: string;
  type: "separator";
}

export interface SidebarSubmenuItem extends SidebarItemMetadata {
  href?: never;
  items: readonly SidebarLeafItem[];
  rel?: never;
  target?: never;
  type: "submenu";
}

export interface SidebarGroupItem {
  className?: ClassValue;
  items: readonly (
    | SidebarLeafItem
    | SidebarSeparatorItem
    | SidebarSubmenuItem
  )[];
  key: string;
  label?: ReactNode;
  labelClassName?: ClassValue;
  type: "group";
}

export type SidebarItem =
  | SidebarGroupItem
  | SidebarLeafItem
  | SidebarSeparatorItem
  | SidebarSubmenuItem;

export interface SidebarProps {
  className?: ClassValue;
  content: ReactNode;
  contentClassName?: ClassValue;
  defaultOpen?: boolean;
  defaultOpenKeys?: readonly string[];
  defaultValue?: string;
  dir?: "ltr" | "rtl";
  footer?: ReactNode;
  footerClassName?: ClassValue;
  header?: ReactNode;
  headerClassName?: ClassValue;
  insetClassName?: ClassValue;
  items: readonly SidebarItem[];
  navigationClassName?: ClassValue;
  navigationLabel?: string;
  onOpenChange?: (open: boolean) => void;
  onOpenKeysChange?: (openKeys: string[]) => void;
  onSelect?: (key: string, item: SidebarLeafItem) => void;
  onValueChange?: (value: string | undefined) => void;
  open?: boolean;
  openKeys?: readonly string[];
  side?: "left" | "right";
  sidebarClassName?: ClassValue;
  value?: string;
  variant?: "floating" | "inset" | "sidebar";
}

export interface SidebarTriggerProps {
  className?: ClassValue;
  label?: string;
}

const assertItemKey = (item: SidebarItem, keys: Set<string>) => {
  if (typeof item.key !== "string") {
    throw new Error("Sidebar items require a string key.");
  }
  if (item.key.trim().length === 0) {
    throw new Error(
      `Sidebar item keys must be non-empty. Received "${item.key}".`
    );
  }
  if (keys.has(item.key)) {
    throw new Error(
      `Sidebar item keys must be unique. Received "${item.key}" twice.`
    );
  }
  keys.add(item.key);
};

const assertParentAllowsItem = (
  parent: SidebarGroupItem | SidebarSubmenuItem | undefined,
  item: SidebarItem
) => {
  if (parent?.type === "group" && item.type === "group") {
    throw new Error(
      `Sidebar group "${parent.key}" accepts only items, submenus, and separators.`
    );
  }
  if (
    parent?.type === "submenu" &&
    item.type !== undefined &&
    item.type !== "item"
  ) {
    throw new Error(`Sidebar submenu "${parent.key}" accepts only leaf items.`);
  }
};

const assertLeafShape = (item: SidebarItem) => {
  const type = item.type as string | undefined;
  if (type !== undefined && type !== "item") {
    throw new Error(
      `Sidebar item "${item.key}" has invalid type "${String(type)}".`
    );
  }
  if ("items" in item) {
    throw new Error(`Sidebar leaf "${item.key}" cannot contain items.`);
  }
};

const validateItems = (items: readonly SidebarItem[]) => {
  const keys = new Set<string>();
  const submenuKeys = new Set<string>();

  const visit = (
    entries: readonly SidebarItem[],
    parent?: SidebarGroupItem | SidebarSubmenuItem
  ) => {
    for (const item of entries) {
      assertItemKey(item, keys);
      assertParentAllowsItem(parent, item);

      if (item.type === "group" || item.type === "submenu") {
        if (!Array.isArray(item.items)) {
          throw new Error(`Sidebar ${item.type} "${item.key}" requires items.`);
        }
        if (item.type === "submenu") {
          submenuKeys.add(item.key);
        }
        visit(item.items, item);
        continue;
      }
      if (item.type === "separator") {
        continue;
      }
      assertLeafShape(item);
    }
  };

  visit(items);
  return submenuKeys;
};

const filterOpenKeys = (
  openKeys: readonly string[],
  submenuKeys: ReadonlySet<string>
) => [...new Set(openKeys.filter((key) => submenuKeys.has(key)))];

const hasContent = (value: ReactNode) =>
  value !== undefined && value !== null && value !== false;

export const SidebarTrigger = ({
  className,
  label = "Toggle sidebar",
}: SidebarTriggerProps) => (
  <SidebarTriggerPrimitive aria-label={label} className={cn(className)} />
);

interface NavigationProps {
  className?: ClassValue;
  items: readonly SidebarItem[];
  label: string;
  onOpenChange: (key: string) => void;
  onSelectionCommit: (item: SidebarLeafItem) => void;
  onSelectionNotify: (item: SidebarLeafItem) => void;
  openKeys: readonly string[];
  value: string | undefined;
}

const Navigation = ({
  className,
  items,
  label,
  onOpenChange,
  onSelectionCommit,
  onSelectionNotify,
  openKeys,
  value,
}: NavigationProps) => {
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  const activateLeaf = (item: SidebarLeafItem) => {
    onSelectionCommit(item);
    if (isMobile) {
      setOpenMobile(false);
    }
    onSelectionNotify(item);
  };

  const renderItemContent = (item: SidebarLeafItem) => (
    <>
      {hasContent(item.icon) ? (
        <span className={cn(item.iconClassName)}>{item.icon}</span>
      ) : null}
      <span className={cn(item.labelClassName)}>{item.label}</span>
    </>
  );

  const renderLeaf = (item: SidebarLeafItem) => (
    <SidebarMenuItem className={cn(item.className)} key={item.key}>
      <SidebarMenuButton
        aria-current={value === item.key ? "page" : undefined}
        disabled={item.href === undefined ? item.disabled : undefined}
        isActive={value === item.key}
        onClick={(event) => {
          if (item.disabled) {
            event.preventDefault();
            return;
          }
          activateLeaf(item);
        }}
        render={
          item.href === undefined ? undefined : (
            // biome-ignore lint/a11y/useAnchorContent: SidebarMenuButton supplies the merged link content.
            <a
              aria-disabled={item.disabled || undefined}
              aria-label={
                typeof item.label === "string" ? item.label : undefined
              }
              href={item.disabled ? undefined : item.href}
              rel={item.rel}
              target={item.target}
            />
          )
        }
        tooltip={typeof item.label === "string" ? item.label : undefined}
        type={item.href === undefined ? "button" : undefined}
      >
        {renderItemContent(item)}
      </SidebarMenuButton>
      {hasContent(item.extra) ? (
        <SidebarMenuBadge className={cn(item.extraClassName)}>
          {item.extra}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );

  const renderSubmenuLeaf = (item: SidebarLeafItem) => (
    <SidebarMenuSubItem className={cn(item.className)} key={item.key}>
      <SidebarMenuSubButton
        aria-current={value === item.key ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        isActive={value === item.key}
        onClick={(event) => {
          if (item.disabled) {
            event.preventDefault();
            return;
          }
          activateLeaf(item);
        }}
        render={
          item.href === undefined ? (
            <button disabled={item.disabled} type="button" />
          ) : (
            // biome-ignore lint/a11y/useAnchorContent: SidebarMenuSubButton supplies the merged link content.
            <a
              aria-label={
                typeof item.label === "string" ? item.label : undefined
              }
              href={item.disabled ? undefined : item.href}
              rel={item.rel}
              target={item.target}
            />
          )
        }
      >
        {renderItemContent(item)}
        {hasContent(item.extra) ? (
          <span className={cn("ml-auto text-xs", item.extraClassName)}>
            {item.extra}
          </span>
        ) : null}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );

  const renderEntry = (
    item: SidebarLeafItem | SidebarSeparatorItem | SidebarSubmenuItem
  ) => {
    if (item.type === "separator") {
      return (
        <li key={item.key} role="none">
          <SidebarSeparator className={cn(item.className)} />
        </li>
      );
    }

    if (item.type === "submenu") {
      const isOpen = openKeys.includes(item.key);

      return (
        <SidebarMenuItem className={cn(item.className)} key={item.key}>
          <SidebarMenuButton
            aria-expanded={isOpen}
            disabled={item.disabled}
            onClick={() => onOpenChange(item.key)}
            tooltip={typeof item.label === "string" ? item.label : undefined}
            type="button"
          >
            {hasContent(item.icon) ? (
              <span className={cn(item.iconClassName)}>{item.icon}</span>
            ) : null}
            <span className={cn(item.labelClassName)}>{item.label}</span>
            {hasContent(item.extra) ? (
              <span className={cn("ml-auto text-xs", item.extraClassName)}>
                {item.extra}
              </span>
            ) : null}
            <span
              aria-hidden="true"
              className={cn("text-xs", !hasContent(item.extra) && "ml-auto")}
            >
              {isOpen ? "▴" : "▾"}
            </span>
          </SidebarMenuButton>
          {isOpen ? (
            <SidebarMenuSub>{item.items.map(renderSubmenuLeaf)}</SidebarMenuSub>
          ) : null}
        </SidebarMenuItem>
      );
    }

    return renderLeaf(item);
  };

  return (
    <nav aria-label={label} className={cn(className)}>
      {items.map((item) => {
        if (item.type === "group") {
          return (
            <SidebarGroup className={cn(item.className)} key={item.key}>
              {hasContent(item.label) ? (
                <SidebarGroupLabel className={cn(item.labelClassName)}>
                  {item.label}
                </SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <SidebarMenu>{item.items.map(renderEntry)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        }

        return (
          <SidebarGroup key={item.key}>
            <SidebarGroupContent>
              <SidebarMenu>{renderEntry(item)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </nav>
  );
};

export const Sidebar = (props: SidebarProps) => {
  const isValueControlled = "value" in props;
  const isOpenKeysControlled = "openKeys" in props;
  const {
    className,
    content,
    contentClassName,
    defaultOpen,
    defaultOpenKeys = [],
    defaultValue,
    dir,
    footer,
    footerClassName,
    header,
    headerClassName,
    insetClassName,
    items,
    navigationClassName,
    navigationLabel = "Primary navigation",
    onOpenChange,
    onOpenKeysChange,
    onSelect,
    onValueChange,
    open,
    openKeys,
    side = "left",
    sidebarClassName,
    value,
    variant = "sidebar",
  } = props;

  const submenuKeys = validateItems(items);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = isValueControlled ? value : internalValue;
  const [internalOpenKeys, setInternalOpenKeys] = useState([
    ...defaultOpenKeys,
  ]);
  const currentOpenKeys = filterOpenKeys(
    isOpenKeysControlled ? (openKeys ?? []) : internalOpenKeys,
    submenuKeys
  );

  const commitSelection = (item: SidebarLeafItem) => {
    if (!isValueControlled) {
      setInternalValue(item.key);
    }
  };

  const notifySelection = (item: SidebarLeafItem) => {
    onValueChange?.(item.key);
    onSelect?.(item.key, item);
  };

  const toggleSubmenu = (key: string) => {
    const nextOpenKeys = currentOpenKeys.includes(key)
      ? currentOpenKeys.filter((openKey) => openKey !== key)
      : [...currentOpenKeys, key];
    if (!isOpenKeysControlled) {
      setInternalOpenKeys(nextOpenKeys);
    }
    onOpenKeysChange?.(nextOpenKeys);
  };

  return (
    <SidebarProvider
      className={cn(className)}
      defaultOpen={defaultOpen}
      dir={dir}
      onOpenChange={onOpenChange}
      open={open}
    >
      <SidebarPrimitive
        className={cn(sidebarClassName)}
        collapsible="offcanvas"
        dir={dir}
        side={side}
        variant={variant}
      >
        {hasContent(header) ? (
          <SidebarHeader className={cn(headerClassName)}>
            {header}
          </SidebarHeader>
        ) : null}
        <SidebarContent>
          <Navigation
            className={navigationClassName}
            items={items}
            label={navigationLabel}
            onOpenChange={toggleSubmenu}
            onSelectionCommit={commitSelection}
            onSelectionNotify={notifySelection}
            openKeys={currentOpenKeys}
            value={selectedValue}
          />
        </SidebarContent>
        {hasContent(footer) ? (
          <SidebarFooter className={cn(footerClassName)}>
            {footer}
          </SidebarFooter>
        ) : null}
      </SidebarPrimitive>
      <SidebarInset className={cn(insetClassName)}>
        <div className={cn("min-h-0 flex-1", contentClassName)}>{content}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Sidebar;
