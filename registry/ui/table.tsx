"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { MinusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ClassValue } from "clsx";
import type React from "react";
import type {
  ComponentProps,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";
import { useEffect, useRef, useState } from "react";
import {
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  Table as TableRoot,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Column types — discriminated union so `render`'s `value` narrows by
// `dataIndex`. Writing `dataIndex: "name"` makes the cell renderer receive
// `T["name"]` instead of `T[keyof T] | undefined`.
// ---------------------------------------------------------------------------

interface TableColumnBase {
  /** Text alignment for both `th` and `td` of this column. */
  align?: "left" | "center" | "right";
  /** Applied only to body cells of this column. */
  cellClassName?: ClassValue;
  /** Applied to both the header cell and every body cell of this column. */
  className?: ClassValue;
  /** Applied only to the header cell of this column. */
  headClassName?: ClassValue;
  /** Stable identifier; also used as React key for the column. */
  key: string;
  /** Header content. */
  title: React.ReactNode;
  /** Column width — emitted as inline `style.width` on both `th` and `td`. */
  width?: number | string;
}

type TableColumnRender<T, K extends keyof T> = (
  value: T[K],
  record: T,
  index: number
) => React.ReactNode;

/** Column with a `dataIndex` — `render` receives the narrowed field value. */
export type TableColumnWithData<T, K extends keyof T> = TableColumnBase & {
  dataIndex: K;
} & (T[K] extends React.ReactNode
    ? { render?: TableColumnRender<T, K> }
    : { render: TableColumnRender<T, K> });

/** Column without `dataIndex` — `render` receives `undefined` for the value. */
export type TableColumnWithoutData<T> = TableColumnBase & {
  dataIndex?: undefined;
  render?: (value: undefined, record: T, index: number) => React.ReactNode;
};

export type TableColumn<T> =
  | TableColumnWithoutData<T>
  | { [K in keyof T]: TableColumnWithData<T, K> }[keyof T];

/**
 * Strips `readonly` so the builder's inferred tuple is directly assignable to
 * the mutable `TableProps.columns` array. Without this, TS reports TS4104 in
 * the IDE when a `readonly [...]` tuple meets a mutable `T[]` parameter.
 */
type MutableTuple<Cs extends readonly unknown[]> = {
  -readonly [I in keyof Cs]: Cs[I];
};

/**
 * Column builder — required for reliable `render(value, …)` narrowing on inline
 * arrays. Without it, TS contextual typing on `const cols: TableColumn<T>[] = [...]`
 * fails under some `tsconfig` strict combos: `value` falls back to `any` and
 * `dataIndex: "nope"` no longer errors. Calling `defineColumns<T>()([...])`
 * binds the generic and uses `const` inference so each element narrows by its
 * `dataIndex` literal.
 *
 * The return type drops `readonly` so it slots straight into `TableProps.columns`
 * (mutable) without TS4104 — preserves narrowing AND keeps the consumer-facing
 * type shape uniform.
 *
 * Usage:
 *   const columns = defineColumns<Order>()([
 *     { dataIndex: "amount", key: "amount", title: "Amount",
 *       render: (value) => fmt(value) }, // value: number
 *   ]);
 */
export function defineColumns<T>() {
  return <const Cs extends readonly TableColumn<T>[]>(
    cs: Cs
  ): MutableTuple<Cs> => cs as unknown as MutableTuple<Cs>;
}

type RowKeyValue = string | number;

type RowKeyField<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends RowKeyValue ? K : never;
}[keyof T];

export type RowKey<T> =
  | RowKeyField<T>
  | ((record: T, index: number) => RowKeyValue);

// ---------------------------------------------------------------------------
// Internal selection checkbox — built directly on base-ui Checkbox primitive
// because shadcn's `<Checkbox>` wrapper hard-codes its indicator (always a
// tick), giving indeterminate no distinct visual. Composing the primitive
// here lets us swap the icon based on `indeterminate`. `components/ui/**` is
// strictly read-only, so the alternative is to inline it at the call site.
//
// MAINTAINER NOTE: the class string below is a hand-copy of
// `components/ui/checkbox.tsx`. When shadcn `checkbox` is upgraded
// (`pnpm dlx shadcn@latest add checkbox --overwrite`), eyeball-diff the
// shadcn `Checkbox` className against this one and resync.
// ---------------------------------------------------------------------------

type SelectionCheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root>;

export type TableCheckboxProps = Omit<
  SelectionCheckboxProps,
  | "checked"
  | "children"
  | "defaultChecked"
  | "indeterminate"
  | "onCheckedChange"
>;

const ROW_INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
].join(",");

function isFromInteractiveDescendant(
  currentTarget: HTMLElement,
  target: EventTarget | null
): boolean {
  if (!(target instanceof Element) || target === currentTarget) {
    return false;
  }
  const interactive = target.closest(ROW_INTERACTIVE_SELECTOR);
  return Boolean(interactive && currentTarget.contains(interactive));
}

function SelectionCheckbox({
  className,
  indeterminate,
  ...rest
}: SelectionCheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        // Disabled visual tokens (Round 7): swap the default
        // `disabled:opacity-50` for an explicit grey fill + soft border so an
        // unchecked-disabled checkbox is clearly distinguishable from a normal
        // unchecked one. `data-checked:*` / `data-indeterminate:*` selectors
        // sit later in the cascade and still override the fill when the row
        // is both checked AND disabled (rare but legal).
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-muted-foreground/30 disabled:bg-muted data-checked:border-primary data-indeterminate:border-primary data-checked:bg-primary data-indeterminate:bg-primary data-checked:text-primary-foreground data-indeterminate:text-primary-foreground dark:bg-input/30",
        className
      )}
      data-slot="easy-table-selection-checkbox"
      indeterminate={indeterminate}
      {...rest}
    >
      {/* base-ui auto-unmounts Indicator while unchecked — exactly what we
          want. Do NOT add `keepMounted`: the tick SVG would stay in the DOM
          on unchecked rows and bleed through (visual bug fixed in round 6). */}
      <CheckboxPrimitive.Indicator
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
        data-slot="easy-table-selection-indicator"
      >
        <HugeiconsIcon
          aria-hidden
          data-icon={indeterminate ? "indeterminate" : "checked"}
          icon={indeterminate ? MinusSignIcon : Tick02Icon}
          strokeWidth={2}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

interface TableOwnedRootProps {
  "aria-busy"?: never;
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-slot"?: never;
}

export interface TableProps<T>
  extends Omit<
      React.ComponentProps<"table">,
      "className" | keyof TableOwnedRootProps
    >,
    TableOwnedRootProps {
  /** className on `<tbody>`. */
  bodyClassName?: ClassValue;
  /** Caption rendered inside `<caption>`. */
  caption?: React.ReactNode;
  /** className on `<caption>`. */
  captionClassName?: ClassValue;
  /** className on the `<table>` root. */
  className?: ClassValue;
  /** Column definitions. */
  columns: TableColumn<T>[];
  /**
   * Data rows. Internally treated as `[]` when `null` / `undefined` are passed,
   * so SWR / React Query's pre-response state can be passed directly.
   */
  dataSource?: T[] | null;
  /** Uncontrolled initial selected keys. */
  defaultSelectedRowKeys?: string[];
  /** className on the empty-state cell. */
  emptyClassName?: ClassValue;
  /** Empty-state message rendered when `dataSource` is empty and not loading. @default "No data" */
  emptyMessage?: React.ReactNode;
  /**
   * Per-row props forwarded to the selection-column Checkbox.
   *
   * Per ADR-0004: Table is a state-machine component, so per-row checkbox
   * control is in-scope coverage (Rule A), and this is the category-3 ownership
   * pattern — the returned checkbox state props are owned by the Table so
   * external props can't desync the selection state. `disabled: true` excludes
   * the row from the header "select all" tally.
   *
   * Keep this function pure and non-throwing — it's invoked for every row on
   * every render. Throwing here unmounts the surrounding tree (error boundary
   * is the consumer's responsibility, not the Table's).
   *
   * Recommended: pass a human-readable `aria-label` here so screen-reader users
   * hear meaningful text instead of the opaque row key. The Table's default
   * (`Select row {key}`) only fires when you don't supply one.
   */
  getCheckboxProps?: (record: T, index: number) => Partial<TableCheckboxProps>;

  /** className on `<thead>`. */
  headerClassName?: ClassValue;

  /** When `true`, the body shows a loading message instead of rows/empty state. */
  loading?: boolean;
  /** className on the loading-state cell. */
  loadingClassName?: ClassValue;
  /** Loading message. @default "Loading…" */
  loadingMessage?: React.ReactNode;

  /**
   * Click handler for each `<tr>`. When provided, rows become focusable
   * (`tabIndex=0`, native `role="row"` preserved) and respond to Enter / Space.
   * Clicks / key presses that originate inside interactive descendants or the
   * selection cell do not bubble through to row activation.
   */
  onRowClick?: (record: T, index: number) => void;
  /**
   * Called when the selection changes. `rows` mirrors the selected records in
   * `dataSource` order so consumers don't need a second lookup.
   */
  onSelectedRowKeysChange?: (keys: string[], rows: T[]) => void;

  /** Per-row className. Function form receives `(record, index)`. */
  rowClassName?: ClassValue | ((record: T, index: number) => ClassValue);
  /**
   * How to derive a stable string key per row. Required — falling back to
   * `index` silently breaks reordering / pagination, so we surface it.
   */
  rowKey: RowKey<T>;

  /** Enable a left-side selection column with checkboxes. */
  selectable?: boolean;
  /** Controlled selected row keys. */
  selectedRowKeys?: string[];
  /** className applied to the selection column's `th` and every selection `td`. */
  selectionColumnClassName?: ClassValue;
  /**
   * Visually-hidden header text for the selection column. Used as the
   * accessible name announced before the "Select all" checkbox.
   * @default "Selection"
   */
  selectionColumnLabel?: string;
}

/**
 * Diagnostic shape returned alongside the stringified key. `kind` is set when
 * the raw `rowKey` value would produce a meaningless / corrupted string.
 */
type ResolvedKey = {
  key: string;
  diagnostic: "invalid" | "nullish" | "symbol" | null;
};

function stringifyRowKey(raw: unknown): ResolvedKey {
  if (raw == null) {
    return { diagnostic: "nullish", key: String(raw) };
  }
  if (typeof raw === "string" || typeof raw === "number") {
    return { diagnostic: null, key: String(raw) };
  }
  if (typeof raw === "symbol") {
    // Calling String() on a Symbol coerces it (`"Symbol(foo)"`) without
    // throwing — but symbol-valued keys still defeat both equality checks and
    // form submission. Surface them.
    return { diagnostic: "symbol", key: raw.toString() };
  }
  return { diagnostic: "invalid", key: String(raw) };
}

function resolveRowKey<T>(
  record: T,
  index: number,
  rowKey: RowKey<T>
): ResolvedKey {
  if (typeof rowKey === "function") {
    return stringifyRowKey(rowKey(record, index));
  }
  return stringifyRowKey(record[rowKey]);
}

function alignClass(align: TableColumnBase["align"]): string | undefined {
  if (align === "center") {
    return "text-center";
  }
  if (align === "right") {
    return "text-right";
  }
  return;
}

function widthStyle(
  width: TableColumnBase["width"]
): React.CSSProperties | undefined {
  if (width === undefined) {
    return;
  }
  return { width };
}

// Heuristic: a table needs an accessible name. Caption, aria-label, or
// aria-labelledby all count. Anything truthy passes the audit.
function hasAccessibleName(
  caption: React.ReactNode,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined
): boolean {
  if (ariaLabel || ariaLabelledBy) {
    return true;
  }
  if (caption === undefined || caption === null || caption === false) {
    return false;
  }
  if (typeof caption === "string") {
    return caption.trim().length > 0;
  }
  return true;
}

function shouldEmitDevWarnings(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test"
  );
}

export function Table<T>({
  "aria-busy": _ignoredAriaBusy,
  children: _ignoredChildren,
  columns,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  dataSource,
  rowKey,
  loading,
  loadingMessage = "Loading…",
  emptyMessage = "No data",
  caption,
  rowClassName,
  onRowClick,
  selectable,
  selectedRowKeys,
  defaultSelectedRowKeys,
  onSelectedRowKeysChange,
  getCheckboxProps,
  selectionColumnClassName,
  selectionColumnLabel = "Selection",
  className,
  headerClassName,
  bodyClassName,
  captionClassName,
  emptyClassName,
  loadingClassName,
  ...tableProps
}: TableProps<T>): ReactElement {
  // Runtime safety: SWR / React Query often hands `data` back as `undefined`
  // before the first response. Treat that as empty rather than throwing.
  const data: T[] = dataSource ?? [];

  const [internalSelected, setInternalSelected] = useState<string[]>(
    defaultSelectedRowKeys ?? []
  );
  const isSelectionControlled = selectedRowKeys !== undefined;
  const currentSelected = isSelectionControlled
    ? (selectedRowKeys as string[])
    : internalSelected;
  const selectedKeySet = new Set(currentSelected);

  // Keep derived state as explicit linear passes. `getCheckboxProps` can change
  // identity on every parent render, so broad useMemo wrappers add complexity
  // without a reliable cache hit.
  const selectionEnabled = Boolean(selectable);
  let sawInvalidKey = false;
  let sawNullishKey = false;
  let sawSymbolKey = false;
  const rowMeta = data.map((record, index) => {
    const resolved = resolveRowKey(record, index, rowKey);
    if (resolved.diagnostic === "invalid") {
      sawInvalidKey = true;
    } else if (resolved.diagnostic === "nullish") {
      sawNullishKey = true;
    } else if (resolved.diagnostic === "symbol") {
      sawSymbolKey = true;
    }
    const checkboxProps =
      selectionEnabled && getCheckboxProps
        ? getCheckboxProps(record, index)
        : {};
    return {
      checkboxProps,
      index,
      key: resolved.key,
      record,
      selected: selectionEnabled && selectedKeySet.has(resolved.key),
    };
  });

  // Map for O(1) "is this key still in rowMeta?" lookups in handleToggleAll.
  // Walks rowMeta once; replaces the previous `Array.prototype.find` loop
  // which was O(N²) at scale.
  const metaByKey = new Map<string, (typeof rowMeta)[number]>();
  for (const meta of rowMeta) {
    metaByKey.set(meta.key, meta);
  }

  const selectableRows: typeof rowMeta = [];
  let selectedSelectableCount = 0;
  for (const meta of rowMeta) {
    if (meta.checkboxProps.disabled) {
      continue;
    }
    selectableRows.push(meta);
    if (meta.selected) {
      selectedSelectableCount++;
    }
  }
  const selectableCount = selectableRows.length;

  const allSelected =
    selectableCount > 0 && selectedSelectableCount === selectableCount;
  const someSelected =
    selectedSelectableCount > 0 && selectedSelectableCount < selectableCount;

  // Fingerprint of the currently-duplicated key set — `null` when no dupes.
  // Lets us re-warn when the offending dataset changes shape, but stay quiet
  // when the same dupes scroll past.
  const dupKeyFingerprint = (() => {
    if (metaByKey.size === data.length) {
      return null;
    }
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const m of rowMeta) {
      if (seen.has(m.key)) {
        dupes.add(m.key);
      } else {
        seen.add(m.key);
      }
    }
    return JSON.stringify(Array.from(dupes).sort());
  })();

  // Fingerprint of duplicate column keys — same pattern.
  const dupColumnKeyFingerprint = (() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const c of columns) {
      if (seen.has(c.key)) {
        dupes.add(c.key);
      } else {
        seen.add(c.key);
      }
    }
    if (dupes.size === 0) {
      return null;
    }
    return JSON.stringify(Array.from(dupes).sort());
  })();

  // ---- Dev-only warnings ----
  // Each warn lives in its own useEffect so the dependency list stays
  // honest (no over-running, no false silence) and the function complexity
  // stays low. They are only emitted in real development builds, not tests.
  const dupKeyWarnedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (
      dupKeyFingerprint !== null &&
      !dupKeyWarnedRef.current.has(dupKeyFingerprint)
    ) {
      dupKeyWarnedRef.current.add(dupKeyFingerprint);
      console.warn(
        "[Table] Duplicate row keys detected. Each row must produce a unique key — check your `rowKey` prop."
      );
    }
  }, [dupKeyFingerprint]);

  const dupColKeyWarnedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (
      dupColumnKeyFingerprint !== null &&
      !dupColKeyWarnedRef.current.has(dupColumnKeyFingerprint)
    ) {
      dupColKeyWarnedRef.current.add(dupColumnKeyFingerprint);
      console.warn(
        "[Table] Duplicate column keys detected. Each `column.key` must be unique."
      );
    }
  }, [dupColumnKeyFingerprint]);

  const nullishKeyWarnedRef = useRef(false);
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (!nullishKeyWarnedRef.current && sawNullishKey) {
      nullishKeyWarnedRef.current = true;
      console.warn(
        '[Table] `rowKey` resolved to null or undefined on at least one row, which stringifies to "null" / "undefined" and collides with other rows. Pick a `rowKey` field that is always present.'
      );
    }
  }, [sawNullishKey]);

  const symbolKeyWarnedRef = useRef(false);
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (!symbolKeyWarnedRef.current && sawSymbolKey) {
      symbolKeyWarnedRef.current = true;
      console.warn(
        "[Table] `rowKey` resolved to a Symbol on at least one row. Symbols don't round-trip through equality checks or form submission — use a string / number identifier."
      );
    }
  }, [sawSymbolKey]);

  const invalidKeyWarnedRef = useRef(false);
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (!invalidKeyWarnedRef.current && sawInvalidKey) {
      invalidKeyWarnedRef.current = true;
      console.warn(
        "[Table] `rowKey` resolved to a non-string / non-number value on at least one row. Use a stable string or number identifier."
      );
    }
  }, [sawInvalidKey]);

  const controlledDefaultWarnedRef = useRef(false);
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (
      !controlledDefaultWarnedRef.current &&
      isSelectionControlled &&
      defaultSelectedRowKeys !== undefined
    ) {
      controlledDefaultWarnedRef.current = true;
      console.warn(
        "[Table] Both `selectedRowKeys` (controlled) and `defaultSelectedRowKeys` were passed. `defaultSelectedRowKeys` is ignored — drop one of them to silence this warning."
      );
    }
  }, [isSelectionControlled, defaultSelectedRowKeys]);

  // Lock in the controlled / uncontrolled choice from first mount; React's
  // own input warnings follow the same pattern.
  const initialControlledRef = useRef(isSelectionControlled);
  const controlledSwitchWarnedRef = useRef(false);
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (
      !controlledSwitchWarnedRef.current &&
      isSelectionControlled !== initialControlledRef.current
    ) {
      controlledSwitchWarnedRef.current = true;
      const from = initialControlledRef.current ? "controlled" : "uncontrolled";
      const to = isSelectionControlled ? "controlled" : "uncontrolled";
      console.warn(
        `[Table] \`selectedRowKeys\` switched from ${from} to ${to}. Pick one — toggling between the two modes resets the selection state and confuses users.`
      );
    }
  }, [isSelectionControlled]);

  const namelessWarnedRef = useRef(false);
  const ariaLabel = tableProps["aria-label"];
  const ariaLabelledBy = tableProps["aria-labelledby"];
  useEffect(() => {
    if (!shouldEmitDevWarnings()) {
      return;
    }
    if (
      !(
        namelessWarnedRef.current ||
        hasAccessibleName(caption, ariaLabel, ariaLabelledBy)
      )
    ) {
      namelessWarnedRef.current = true;
      console.warn(
        "[Table] No accessible name. Pass `caption`, `aria-label`, or `aria-labelledby` so screen-reader users can identify this table (WCAG 1.3.1)."
      );
    }
  }, [caption, ariaLabel, ariaLabelledBy]);

  const emit = (nextKeys: string[]) => {
    if (!isSelectionControlled) {
      setInternalSelected(nextKeys);
    }
    if (onSelectedRowKeysChange) {
      const rows: T[] = [];
      // Walk data so the emitted rows array stays in source order.
      const set = new Set(nextKeys);
      for (let i = 0; i < data.length; i++) {
        const { key } = resolveRowKey(data[i], i, rowKey);
        if (set.has(key)) {
          rows.push(data[i]);
        }
      }
      onSelectedRowKeysChange(nextKeys, rows);
    }
  };

  const handleToggleAll = (next: boolean) => {
    // Preserve any currently-selected keys that point to disabled or
    // since-removed rows — the header only governs the selectable subset.
    const preserved = currentSelected.filter((k) => {
      const meta = metaByKey.get(k);
      // Row no longer in dataSource: keep it (caller owns lifecycle).
      if (!meta) {
        return true;
      }
      return Boolean(meta.checkboxProps.disabled);
    });
    if (next) {
      const additions = selectableRows.map((r) => r.key);
      // Merge while preserving order: dataSource order first, then preserved tail.
      const seen = new Set<string>();
      const merged: string[] = [];
      for (const k of [...additions, ...preserved]) {
        if (!seen.has(k)) {
          seen.add(k);
          merged.push(k);
        }
      }
      emit(merged);
      return;
    }
    emit(preserved);
  };

  const handleToggleRow = (key: string, next: boolean) => {
    if (next) {
      if (selectedKeySet.has(key)) {
        return;
      }
      emit([...currentSelected, key]);
      return;
    }
    emit(currentSelected.filter((k) => k !== key));
  };

  const colSpan = Math.max(1, columns.length + (selectionEnabled ? 1 : 0));

  const handleRowClick = (
    event: MouseEvent<HTMLTableRowElement>,
    record: T,
    index: number
  ) => {
    if (
      !onRowClick ||
      isFromInteractiveDescendant(event.currentTarget, event.target)
    ) {
      return;
    }
    onRowClick(record, index);
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    record: T,
    index: number
  ) => {
    if (
      !onRowClick ||
      isFromInteractiveDescendant(event.currentTarget, event.target)
    ) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      // Space would otherwise scroll the page.
      event.preventDefault();
      onRowClick(record, index);
    }
  };

  return (
    <TableRoot
      {...tableProps}
      aria-busy={loading || undefined}
      className={cn(className)}
      data-slot="easy-table"
    >
      {caption && (
        <TableCaption className={cn(captionClassName)}>{caption}</TableCaption>
      )}
      <TableHeader className={cn(headerClassName)}>
        <TableRow>
          {selectionEnabled && (
            <TableHead
              className={cn("w-[1%]", selectionColumnClassName)}
              data-slot="easy-table-selection-head"
              scope="col"
            >
              {/* Visually-hidden column name so sighted users still get the
                  "Select all" affordance and AT users hear a real column
                  header before the checkbox. */}
              <span className="sr-only">{selectionColumnLabel}</span>
              <SelectionCheckbox
                aria-label="Select all rows"
                checked={allSelected}
                // While loading the body rows are hidden — selecting unseen
                // rows from the header would be a blind bulk action.
                disabled={loading || selectableCount === 0}
                indeterminate={someSelected}
                onCheckedChange={handleToggleAll}
              />
            </TableHead>
          )}
          {columns.map((col) => (
            <TableHead
              className={cn(
                alignClass(col.align),
                col.className,
                col.headClassName
              )}
              key={col.key}
              scope="col"
              style={widthStyle(col.width)}
            >
              {col.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className={cn(bodyClassName)}>
        {loading && (
          <TableRow>
            <TableCell
              className={cn(
                "h-24 text-center text-muted-foreground",
                loadingClassName
              )}
              colSpan={colSpan}
            >
              <div aria-live="polite" role="status">
                {loadingMessage}
              </div>
            </TableCell>
          </TableRow>
        )}
        {!loading && data.length === 0 && (
          <TableRow>
            <TableCell
              className={cn(
                "h-24 text-center text-muted-foreground",
                emptyClassName
              )}
              colSpan={colSpan}
            >
              <div aria-live="polite" role="status">
                {emptyMessage}
              </div>
            </TableCell>
          </TableRow>
        )}
        {!loading &&
          rowMeta.map(({ checkboxProps, index, key, record, selected }) => {
            const rowCls =
              typeof rowClassName === "function"
                ? rowClassName(record, index)
                : rowClassName;
            const interactive = Boolean(onRowClick);
            // External checkbox state props are intentionally discarded — Table
            // owns selection state. `aria-label` is left intact so consumers can
            // override the opaque default below.
            const {
              checked: _ignoredChecked,
              children: _ignoredChildren,
              defaultChecked: _ignoredDefaultChecked,
              indeterminate: _ignoredIndeterminate,
              onCheckedChange: _ignoredOnCheckedChange,
              ...passthroughCheckboxProps
            } = checkboxProps as Partial<SelectionCheckboxProps>;
            return (
              <TableRow
                className={cn(
                  // `outline-offset:-2px` keeps the focus ring inside the row
                  // so it isn't clipped by a parent `rounded-md border`
                  // wrapper (the recommended demo pattern).
                  interactive &&
                    "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:[outline-offset:-2px]",
                  rowCls
                )}
                data-state={selected ? "selected" : undefined}
                key={key}
                onClick={
                  interactive
                    ? (e) => handleRowClick(e, record, index)
                    : undefined
                }
                onKeyDown={
                  interactive
                    ? (e) => handleRowKeyDown(e, record, index)
                    : undefined
                }
                // Preserve the implicit row semantics of <tr>; overriding to
                // `role="button"` would strip the table structure. Keyboard
                // activation is provided via tabIndex + onKeyDown(Enter/Space).
                tabIndex={interactive ? 0 : undefined}
              >
                {selectionEnabled && (
                  <TableCell
                    className={cn(selectionColumnClassName)}
                    data-slot="easy-table-selection-cell"
                    // Clicks (and key presses) inside the selection cell must
                    // not bubble up to the row's onRowClick handler.
                    onClick={(e: MouseEvent<HTMLTableCellElement>) =>
                      e.stopPropagation()
                    }
                    onKeyDown={(e: KeyboardEvent<HTMLTableCellElement>) =>
                      e.stopPropagation()
                    }
                  >
                    <SelectionCheckbox
                      aria-label={`Select row ${key}`}
                      {...passthroughCheckboxProps}
                      checked={selected}
                      onCheckedChange={(next) => handleToggleRow(key, next)}
                    />
                  </TableCell>
                )}
                {columns.map((col) => {
                  const value =
                    col.dataIndex === undefined
                      ? undefined
                      : record[col.dataIndex];
                  const content = col.render
                    ? // The discriminated union narrows correctly externally,
                      // but inside the generic body the two render signatures
                      // can't be reconciled without an unsafe cast.
                      // biome-ignore lint/suspicious/noExplicitAny: see comment above
                      (col.render as any)(value, record, index)
                    : (value as React.ReactNode);
                  return (
                    <TableCell
                      className={cn(
                        alignClass(col.align),
                        col.className,
                        col.cellClassName
                      )}
                      key={col.key}
                      style={widthStyle(col.width)}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
      </TableBody>
    </TableRoot>
  );
}

export default Table;
