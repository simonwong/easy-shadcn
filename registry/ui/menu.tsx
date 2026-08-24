// biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA menu pattern uses list containers.
"use client";

import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ClassValue } from "clsx";
import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface MenuItemBase {
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

export interface MenuLeafItem extends MenuItemBase {
  children?: never;
  href?: string;
  rel?: string;
  target?: string;
  type?: "item";
}

export interface MenuSubmenuItem extends MenuItemBase {
  children: MenuItem[];
  href?: never;
  type?: "submenu";
}

export interface MenuGroupItem {
  children: MenuItem[];
  className?: ClassValue;
  key: string;
  label: ReactNode;
  labelClassName?: ClassValue;
  type: "group";
}

export interface MenuSeparatorItem {
  className?: ClassValue;
  key: string;
  type: "separator";
}

export type MenuItem =
  | MenuGroupItem
  | MenuLeafItem
  | MenuSeparatorItem
  | MenuSubmenuItem;

interface MenuBaseProps
  extends Omit<
    ComponentProps<"ul">,
    "children" | "defaultValue" | "onChange" | "onSelect"
  > {
  defaultOpenKeys?: string[];
  extraClassName?: ClassValue;
  iconClassName?: ClassValue;
  itemClassName?: ClassValue;
  items: MenuItem[];
  labelClassName?: ClassValue;
  mode?: "horizontal" | "inline" | "vertical";
  onOpenKeysChange?: (openKeys: string[]) => void;
  onSelect?: (key: string, item: MenuLeafItem) => void;
  openKeys?: string[];
  selectable?: boolean;
  submenuClassName?: ClassValue;
}

export interface MenuSingleProps extends MenuBaseProps {
  defaultValue?: string;
  multiple?: false;
  onValueChange?: (value: string | undefined) => void;
  value?: string;
}

export interface MenuMultipleProps extends MenuBaseProps {
  defaultValue?: string[];
  multiple: true;
  onValueChange?: (value: string[]) => void;
  value?: string[];
}

export type MenuProps = MenuMultipleProps | MenuSingleProps;

const isSubmenu = (item: MenuItem): item is MenuSubmenuItem =>
  item.type !== "group" && item.type !== "separator" && "children" in item;

const hasSelectedDescendant = (
  item: MenuItem,
  selectedKeys: Set<string>
): boolean => {
  if (item.type === "separator") {
    return false;
  }
  if (item.type === "group" || isSubmenu(item)) {
    return item.children.some((child) =>
      hasSelectedDescendant(child, selectedKeys)
    );
  }
  return selectedKeys.has(item.key);
};

const getSelectedValues = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined) {
    return [];
  }
  return [value];
};

const getNextMultipleValue = (
  selectedKeys: Set<string>,
  itemKey: string
): string[] => {
  if (selectedKeys.has(itemKey)) {
    return [...selectedKeys].filter((key) => key !== itemKey);
  }
  return [...selectedKeys, itemKey];
};

const getFirstFocusableKey = (items: MenuItem[]): string | undefined => {
  for (const item of items) {
    if (item.type === "separator") {
      continue;
    }
    if (item.type === "group") {
      const childKey = getFirstFocusableKey(item.children);
      if (childKey !== undefined) {
        return childKey;
      }
      continue;
    }
    if (!item.disabled) {
      return item.key;
    }
  }
};

const hasFocusableKey = (items: MenuItem[], key: string): boolean => {
  for (const item of items) {
    if (item.type === "group") {
      if (hasFocusableKey(item.children, key)) {
        return true;
      }
    } else if (
      item.type !== "separator" &&
      item.key === key &&
      !item.disabled
    ) {
      return true;
    }
  }
  return false;
};

export const Menu = (props: MenuProps) => {
  const {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    defaultValue: _defaultValue,
    defaultOpenKeys = [],
    extraClassName,
    iconClassName,
    itemClassName,
    items,
    labelClassName,
    mode = "vertical",
    multiple = false,
    onKeyDown,
    onOpenKeysChange,
    onSelect,
    onValueChange,
    openKeys,
    selectable = true,
    submenuClassName,
    value,
    ...rootProps
  } = props;
  const baseId = useId();
  const rootRef = useRef<HTMLUListElement>(null);
  const valueControlled = "value" in props;
  const openControlled = "openKeys" in props;
  const [internalValue, setInternalValue] = useState<
    string | string[] | undefined
  >(props.defaultValue);
  const [internalOpenKeys, setInternalOpenKeys] =
    useState<string[]>(defaultOpenKeys);
  const [activeKey, setActiveKey] = useState<string>();
  const currentValue = valueControlled ? value : internalValue;
  const currentOpenKeys = openControlled ? (openKeys ?? []) : internalOpenKeys;
  const selectedKeys = new Set(getSelectedValues(currentValue));
  const openedKeys = new Set(currentOpenKeys);
  const tabStopKey =
    activeKey !== undefined && hasFocusableKey(items, activeKey)
      ? activeKey
      : getFirstFocusableKey(items);

  const changeOpenKeys = (nextOpenKeys: string[]) => {
    if (!openControlled) {
      setInternalOpenKeys(nextOpenKeys);
    }
    onOpenKeysChange?.(nextOpenKeys);
  };

  const toggleSubmenu = (key: string) => {
    const nextOpenKeys = openedKeys.has(key)
      ? currentOpenKeys.filter((openKey) => openKey !== key)
      : [...currentOpenKeys, key];
    changeOpenKeys(nextOpenKeys);
  };

  const selectItem = (item: MenuLeafItem) => {
    if (item.disabled) {
      return;
    }

    if (selectable) {
      const nextValue = multiple
        ? getNextMultipleValue(selectedKeys, item.key)
        : item.key;

      if (!valueControlled) {
        setInternalValue(nextValue);
      }
      if (multiple) {
        (onValueChange as MenuMultipleProps["onValueChange"])?.(
          nextValue as string[]
        );
      } else {
        (onValueChange as MenuSingleProps["onValueChange"])?.(
          nextValue as string
        );
      }
    }

    onSelect?.(item.key, item);
    if (mode !== "inline" && currentOpenKeys.length > 0) {
      changeOpenKeys([]);
    }
  };

  const getVisibleControls = (): HTMLElement[] =>
    Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-menu-control]") ??
        []
    ).filter(
      (element) =>
        !element.closest("[hidden]") &&
        element.getAttribute("aria-disabled") !== "true" &&
        !element.hasAttribute("disabled")
    );

  const focusRelative = (current: HTMLElement, offset: number) => {
    const controls = getVisibleControls();
    const currentIndex = controls.indexOf(current);
    const nextIndex =
      (currentIndex + offset + controls.length) % controls.length;
    controls[nextIndex]?.focus();
  };

  const focusSubmenu = (key: string) => {
    requestAnimationFrame(() => {
      getVisibleControls()
        .find((control) => control.dataset.parentKey === key)
        ?.focus();
    });
  };

  const openSubmenuAndFocus = (key: string) => {
    if (!openedKeys.has(key)) {
      changeOpenKeys([...currentOpenKeys, key]);
    }
    focusSubmenu(key);
  };

  const closeParentAndFocus = (parentKey: string) => {
    changeOpenKeys(currentOpenKeys.filter((openKey) => openKey !== parentKey));
    getVisibleControls()
      .find((control) => control.dataset.menuKey === parentKey)
      ?.focus();
  };

  const handleBoundaryKey = (
    event: KeyboardEvent<HTMLUListElement>
  ): boolean => {
    if (event.key !== "Home" && event.key !== "End") {
      return false;
    }
    event.preventDefault();
    const controls = getVisibleControls();
    const next = event.key === "Home" ? controls[0] : controls.at(-1);
    next?.focus();
    return true;
  };

  const handleEscapeKey = (
    event: KeyboardEvent<HTMLUListElement>,
    parentKey?: string
  ): boolean => {
    if (event.key !== "Escape") {
      return false;
    }
    if (currentOpenKeys.length === 0) {
      return true;
    }
    event.preventDefault();
    if (parentKey) {
      closeParentAndFocus(parentKey);
    } else {
      changeOpenKeys([]);
    }
    return true;
  };

  const handleArrowKey = (
    event: KeyboardEvent<HTMLUListElement>,
    target: HTMLElement
  ) => {
    const depth = Number(target.dataset.depth ?? 0);
    const itemKey = target.dataset.menuKey;
    const parentKey = target.dataset.parentKey;
    const submenuTrigger = target.dataset.submenuTrigger === "true";

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (mode === "horizontal" && depth === 0 && submenuTrigger && itemKey) {
        openSubmenuAndFocus(itemKey);
      } else {
        focusRelative(target, 1);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusRelative(target, -1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (submenuTrigger && itemKey) {
        openSubmenuAndFocus(itemKey);
      } else {
        focusRelative(target, 1);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (parentKey) {
        closeParentAndFocus(parentKey);
      } else {
        focusRelative(target, -1);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const target = event.target;
    if (
      !(
        target instanceof HTMLElement &&
        target.hasAttribute("data-menu-control")
      )
    ) {
      return;
    }

    const parentKey = target.dataset.parentKey;
    if (handleBoundaryKey(event) || handleEscapeKey(event, parentKey)) {
      return;
    }
    handleArrowKey(event, target);
  };

  useEffect(() => {
    if (mode === "inline" || currentOpenKeys.length === 0) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        changeOpenKeys([]);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  });

  const renderContent = (item: MenuItemBase) => (
    <>
      {item.icon === undefined ? null : (
        <span className={cn(iconClassName, item.iconClassName)}>
          {item.icon}
        </span>
      )}
      <span className={cn(labelClassName, item.labelClassName)}>
        {item.label}
      </span>
      {item.extra === undefined ? null : (
        <span className={cn("ml-auto", extraClassName, item.extraClassName)}>
          {item.extra}
        </span>
      )}
    </>
  );

  const getItemClassName = (item: MenuItemBase) => {
    const selected = selectedKeys.has(item.key);
    const descendantSelected = hasSelectedDescendant(item, selectedKeys);
    return cn(
      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors",
      "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
      (selected || descendantSelected) && "bg-accent text-accent-foreground",
      item.disabled && "pointer-events-none opacity-50",
      itemClassName,
      item.className
    );
  };

  const renderSeparatorItem = (item: MenuSeparatorItem) => (
    <li key={item.key} role="none">
      <hr className={cn("my-1 border-border", item.className)} />
    </li>
  );

  const renderGroupItem = (
    item: MenuGroupItem,
    depth: number,
    parentKey: string | undefined,
    itemPath: string
  ) => (
    <li className={cn("py-1", item.className)} key={item.key} role="none">
      <div
        className={cn(
          "px-3 py-1.5 font-medium text-muted-foreground text-xs",
          item.labelClassName
        )}
        role="presentation"
      >
        {item.label}
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: ARIA menu groups keep list semantics. */}
      <ul role="group">
        {renderItems(item.children, depth, parentKey, itemPath)}
      </ul>
    </li>
  );

  const renderSubmenuItem = (
    item: MenuSubmenuItem,
    depth: number,
    parentKey: string | undefined,
    itemPath: string
  ) => {
    const open = openedKeys.has(item.key);
    const submenuId = `${baseId}-submenu-${itemPath}`;
    const popup = mode !== "inline";
    const opensBelow = mode === "horizontal" && depth === 0;

    return (
      <li className="relative" key={item.key} role="none">
        <button
          aria-controls={submenuId}
          aria-expanded={open}
          aria-haspopup="menu"
          className={getItemClassName(item)}
          data-depth={depth}
          data-menu-control=""
          data-menu-key={item.key}
          data-parent-key={parentKey}
          data-submenu-trigger="true"
          disabled={item.disabled}
          onClick={() => toggleSubmenu(item.key)}
          onFocus={() => setActiveKey(item.key)}
          role="menuitem"
          tabIndex={item.key === tabStopKey ? 0 : -1}
          type="button"
        >
          {renderContent(item)}
          <HugeiconsIcon
            className="ml-auto size-4 shrink-0"
            icon={
              mode === "inline" || opensBelow
                ? ArrowDown01Icon
                : ArrowRight01Icon
            }
            strokeWidth={2}
          />
        </button>
        <ul
          aria-orientation="vertical"
          className={cn(
            "min-w-48 rounded-lg p-1",
            popup &&
              "absolute z-50 border bg-popover text-popover-foreground shadow-md",
            mode === "inline" && "mt-1 ml-4 border-l pl-2",
            popup && opensBelow && "top-full left-0 mt-1",
            popup && !opensBelow && "top-0 left-full ml-1",
            submenuClassName
          )}
          data-submenu-key={item.key}
          hidden={!open}
          id={submenuId}
          role="menu"
        >
          {renderItems(item.children, depth + 1, item.key, itemPath)}
        </ul>
      </li>
    );
  };

  const renderLeafItem = (
    item: MenuLeafItem,
    depth: number,
    parentKey?: string
  ) => {
    const selected = selectedKeys.has(item.key);
    const content = renderContent(item);
    const controlProps = {
      "aria-current": selected ? ("page" as const) : undefined,
      "data-depth": depth,
      "data-menu-control": "",
      "data-menu-key": item.key,
      "data-parent-key": parentKey,
      "data-selected": selected,
      role: "menuitem",
    };

    if (item.href === undefined) {
      return (
        <li key={item.key} role="none">
          <button
            {...controlProps}
            className={getItemClassName(item)}
            disabled={item.disabled}
            onClick={() => selectItem(item)}
            onFocus={() => setActiveKey(item.key)}
            tabIndex={item.key === tabStopKey ? 0 : -1}
            type="button"
          >
            {content}
          </button>
        </li>
      );
    }

    return (
      <li key={item.key} role="none">
        <a
          {...controlProps}
          aria-disabled={item.disabled || undefined}
          className={getItemClassName(item)}
          href={item.disabled ? undefined : item.href}
          onClick={(event) => {
            if (item.disabled) {
              event.preventDefault();
              return;
            }
            selectItem(item);
          }}
          onFocus={() => setActiveKey(item.key)}
          rel={item.rel}
          tabIndex={item.key === tabStopKey && !item.disabled ? 0 : -1}
          target={item.target}
        >
          {content}
        </a>
      </li>
    );
  };

  const renderItem = (
    item: MenuItem,
    index: number,
    depth: number,
    parentKey: string | undefined,
    path: string
  ) => {
    const itemPath = `${path}-${index}`;
    if (item.type === "separator") {
      return renderSeparatorItem(item);
    }
    if (item.type === "group") {
      return renderGroupItem(item, depth, parentKey, itemPath);
    }
    if (isSubmenu(item)) {
      return renderSubmenuItem(item, depth, parentKey, itemPath);
    }
    return renderLeafItem(item, depth, parentKey);
  };

  function renderItems(
    entries: MenuItem[],
    depth = 0,
    parentKey?: string,
    path = "root"
  ): ReactNode {
    return entries.map((item, index) =>
      renderItem(item, index, depth, parentKey, path)
    );
  }

  return (
    <ul
      {...rootProps}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-orientation={mode === "horizontal" ? "horizontal" : "vertical"}
      className={cn(
        "flex gap-1 rounded-lg p-1",
        mode === "horizontal" ? "flex-row" : "w-full flex-col",
        className
      )}
      data-mode={mode}
      onKeyDown={handleKeyDown}
      ref={rootRef}
      role="menu"
    >
      {renderItems(items)}
    </ul>
  );
};

export default Menu;
