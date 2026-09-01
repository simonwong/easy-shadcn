"use client";

import type { ClassValue } from "clsx";
import {
  type AriaAttributes,
  type DOMAttributes,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MAC_PLATFORM_PATTERN = /Mac/;

interface CommandPaletteOwnedProps {
  activeValue?: never;
  "aria-describedby"?: never;
  "aria-labelledby"?: never;
  "aria-modal"?: never;
  children?: never;
  commandProps?: never;
  dangerouslySetInnerHTML?: never;
  "data-slot"?: never;
  defaultActiveValue?: never;
  defaultQuery?: never;
  defaultValue?: never;
  dialogProps?: never;
  filter?: never;
  inputProps?: never;
  itemProps?: never;
  listProps?: never;
  loadItems?: never;
  onActiveValueChange?: never;
  onQueryChange?: never;
  onValueChange?: never;
  query?: never;
  render?: never;
  role?: never;
  rootProps?: never;
  shouldFilter?: never;
  slots?: never;
  value?: never;
}

type NeverProps<Keys extends PropertyKey> = {
  [Key in Keys]?: never;
};

type CommandPaletteOwnedActionAriaProps = NeverProps<keyof AriaAttributes>;

type CommandPaletteOwnedActionEventProps = NeverProps<
  Exclude<keyof DOMAttributes<HTMLElement>, "onSelect">
>;

interface CommandPaletteOwnedActionProps
  extends CommandPaletteOwnedActionAriaProps,
    CommandPaletteOwnedActionEventProps {
  children?: never;
  closeOnSelect?: never;
  dangerouslySetInnerHTML?: never;
  "data-disabled"?: never;
  "data-selected"?: never;
  "data-slot"?: never;
  forceMount?: never;
  itemProps?: never;
  render?: never;
  role?: never;
}

interface CommandPaletteOwnedGroupProps
  extends NeverProps<keyof AriaAttributes> {
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-disabled"?: never;
  "data-selected"?: never;
  "data-slot"?: never;
  "data-value"?: never;
  forceMount?: never;
  groupProps?: never;
  render?: never;
  role?: never;
}

export interface CommandPaletteAction extends CommandPaletteOwnedActionProps {
  className?: ClassValue;
  description?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  keywords?: readonly string[];
  label: string;
  onSelect: () => PromiseLike<void> | void;
  shortcut?: ReactNode;
  type?: "item";
  value: string;
}

export interface CommandPaletteGroup extends CommandPaletteOwnedGroupProps {
  className?: ClassValue;
  headingClassName?: ClassValue;
  items: readonly CommandPaletteAction[];
  label: string;
  type: "group";
  value: string;
}

export type CommandPaletteEntry = CommandPaletteAction | CommandPaletteGroup;

export interface CommandPaletteProps extends CommandPaletteOwnedProps {
  className?: ClassValue;
  defaultOpen?: boolean;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  emptyClassName?: ClassValue;
  emptyMessage?: ReactNode;
  errorClassName?: ClassValue;
  errorMessage?: ReactNode;
  groupClassName?: ClassValue;
  headingClassName?: ClassValue;
  hotkey?: boolean;
  inputClassName?: ClassValue;
  inputLabel?: string;
  itemClassName?: ClassValue;
  items: readonly CommandPaletteEntry[];
  listClassName?: ClassValue;
  loadingClassName?: ClassValue;
  loadingMessage?: ReactNode;
  loop?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placeholder?: string;
  shortcutClassName?: ClassValue;
  title?: ReactNode;
  trigger?: ReactElement;
}

const isGroup = (entry: CommandPaletteEntry): entry is CommandPaletteGroup =>
  entry.type === "group";

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest(
    'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
  ) !== null;

const isMacPlatform = () =>
  typeof navigator !== "undefined" &&
  MAC_PLATFORM_PATTERN.test(navigator.platform);

const getValidatedValues = (items: readonly CommandPaletteEntry[]) => {
  const actionTokens = new Map<string, number>();
  const values = new Set<string>();
  const normalizedValues = new Map<string, string>();
  let actionIndex = 0;

  const addValue = (value: string) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
      throw new Error("CommandPalette values must be non-empty strings.");
    }
    if (values.has(normalized)) {
      throw new Error(
        `CommandPalette received duplicate value "${normalized}".`
      );
    }
    values.add(normalized);
    normalizedValues.set(value, normalized);
  };

  for (const entry of items) {
    addValue(entry.value);
    if (isGroup(entry)) {
      for (const item of entry.items) {
        addValue(item.value);
        actionTokens.set(item.value, actionIndex);
        actionIndex += 1;
      }
    } else {
      actionTokens.set(entry.value, actionIndex);
      actionIndex += 1;
    }
  }

  return { actionTokens, normalizedValues };
};

export const CommandPalette = ({
  className,
  defaultOpen = false,
  description = "Search for a command to run.",
  descriptionClassName,
  emptyClassName,
  emptyMessage = "No results found.",
  errorClassName,
  errorMessage = "Command failed. Try again.",
  groupClassName,
  headingClassName,
  hotkey = true,
  inputClassName,
  inputLabel = "Search commands",
  itemClassName,
  items,
  listClassName,
  loadingClassName,
  loadingMessage = "Running command...",
  loop = true,
  onOpenChange,
  open,
  placeholder = "Type a command or search...",
  shortcutClassName,
  title = "Command palette",
  trigger,
}: CommandPaletteProps) => {
  const { actionTokens, normalizedValues } = getValidatedValues(items);
  const descriptionBaseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const pendingAction = useRef<{
    session: number;
    token: symbol;
  } | null>(null);
  const session = useRef(0);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const errorSequence = useRef(0);
  const [errorAttempt, setErrorAttempt] = useState<number>();
  const [pendingValue, setPendingValue] = useState<string>();
  const [query, setQuery] = useState("");
  const openControlled = open !== undefined;
  const currentOpen = openControlled ? open : internalOpen;
  const previousOpen = useRef(currentOpen);

  const requestOpen = useCallback(
    (nextOpen: boolean) => {
      if (!openControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, openControlled]
  );

  const requestOpenRef = useRef(requestOpen);
  requestOpenRef.current = requestOpen;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingAction.current = null;
    };
  }, []);

  useEffect(() => {
    const wasOpen = previousOpen.current;
    previousOpen.current = currentOpen;
    if (wasOpen !== currentOpen) {
      session.current += 1;
    }
    if (wasOpen && !currentOpen) {
      pendingAction.current = null;
      setErrorAttempt(undefined);
      setPendingValue(undefined);
      setQuery("");
    }
  }, [currentOpen]);

  useEffect(() => {
    if (currentOpen && errorAttempt !== undefined) {
      inputRef.current?.focus();
    }
  }, [currentOpen, errorAttempt]);

  useEffect(() => {
    if (!hotkey) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const platformModifier = isMacPlatform()
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey;
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.altKey ||
        event.shiftKey ||
        event.key.toLowerCase() !== "k" ||
        !platformModifier ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      requestOpen(!currentOpen);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentOpen, hotkey, requestOpen]);

  const settleAction = (
    transaction: NonNullable<typeof pendingAction.current>,
    outcome: "error" | "success"
  ) => {
    if (
      !mounted.current ||
      pendingAction.current?.token !== transaction.token ||
      transaction.session !== session.current
    ) {
      return;
    }

    pendingAction.current = null;
    setPendingValue(undefined);
    if (outcome === "error") {
      errorSequence.current += 1;
      setErrorAttempt(errorSequence.current);
      return;
    }
    requestOpenRef.current(false);
  };

  const selectAction = (action: CommandPaletteAction) => {
    if (action.disabled || pendingAction.current) {
      return;
    }

    const transaction = {
      session: session.current,
      token: Symbol(action.value),
    };
    pendingAction.current = transaction;
    setErrorAttempt(undefined);

    let result: PromiseLike<void> | void;
    try {
      result = action.onSelect();
    } catch {
      settleAction(transaction, "error");
      return;
    }

    if (result !== undefined) {
      setPendingValue(normalizedValues.get(action.value));
      Promise.resolve(result).then(
        () => settleAction(transaction, "success"),
        () => settleAction(transaction, "error")
      );
      return;
    }
    settleAction(transaction, "success");
  };

  const isPending = pendingValue !== undefined;

  const renderAction = (action: CommandPaletteAction) => {
    const descriptionId = hasNode(action.description)
      ? `${descriptionBaseId}-action-${actionTokens.get(action.value)}-description`
      : undefined;

    return (
      <CommandItem
        aria-describedby={descriptionId}
        aria-label={action.label}
        className={cn(itemClassName, action.className)}
        disabled={action.disabled || isPending}
        key={normalizedValues.get(action.value)}
        keywords={[action.label, ...(action.keywords ?? [])]}
        onSelect={() => selectAction(action)}
        value={normalizedValues.get(action.value)}
      >
        {hasNode(action.icon) && (
          <span aria-hidden data-slot="command-palette-icon">
            {action.icon}
          </span>
        )}
        <span data-slot="command-palette-label">{action.label}</span>
        {hasNode(action.description) && (
          <span
            className={cn(
              "text-muted-foreground text-xs",
              descriptionClassName
            )}
            data-slot="command-palette-description"
            id={descriptionId}
          >
            {action.description}
          </span>
        )}
        {hasNode(action.shortcut) && (
          <CommandShortcut
            aria-hidden
            className={cn(shortcutClassName)}
            data-slot="command-palette-shortcut"
          >
            {action.shortcut}
          </CommandShortcut>
        )}
        {pendingValue === normalizedValues.get(action.value) && (
          <span
            aria-hidden
            className="size-3 animate-spin rounded-full border border-current border-t-transparent"
            data-slot="command-palette-spinner"
          />
        )}
      </CommandItem>
    );
  };

  return (
    <Dialog onOpenChange={requestOpen} open={currentOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        aria-modal="true"
        className={cn("overflow-hidden p-0 sm:max-w-lg", className)}
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command label={inputLabel} loop={loop}>
          <CommandInput
            aria-label={inputLabel}
            autoFocus
            className={cn(inputClassName)}
            disabled={isPending}
            onValueChange={setQuery}
            placeholder={placeholder}
            ref={inputRef}
            value={query}
          />
          <CommandList
            aria-busy={isPending ? true : undefined}
            className={cn(listClassName)}
          >
            <CommandEmpty className={cn(emptyClassName)}>
              {emptyMessage}
            </CommandEmpty>
            {items.map((entry) =>
              isGroup(entry) ? (
                <CommandGroup
                  className={cn(groupClassName, entry.className)}
                  heading={
                    <span
                      className={cn(headingClassName, entry.headingClassName)}
                    >
                      {entry.label}
                    </span>
                  }
                  key={normalizedValues.get(entry.value)}
                >
                  {entry.items.map(renderAction)}
                </CommandGroup>
              ) : (
                renderAction(entry)
              )
            )}
          </CommandList>
          {isPending && (
            <div
              aria-live="polite"
              className={cn(
                "px-3 py-2 text-muted-foreground text-sm",
                loadingClassName
              )}
              data-slot="command-palette-loading"
              role="status"
            >
              {loadingMessage}
            </div>
          )}
          {errorAttempt !== undefined && (
            <div
              className={cn(
                "px-3 py-2 text-destructive text-sm",
                errorClassName
              )}
              data-slot="command-palette-error"
              key={errorAttempt}
              role="alert"
            >
              {errorMessage}
            </div>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
};
