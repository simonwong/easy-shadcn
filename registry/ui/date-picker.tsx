"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ClassValue } from "clsx";
import type { Locale } from "date-fns";
import { format as formatDate, isValid, parse } from "date-fns";
import type React from "react";
import { useId, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/registry/ui/calendar";

// ---------- Types ----------

type DatePickerBaseProps = {
  /**
   * `date-fns` format string applied to the displayed value and used to parse
   * input back into a `Date` when `withInput` is enabled.
   * @default "PPP"
   */
  format?: string;
  /** `date-fns` locale forwarded to both the formatter and the Calendar. */
  locale?: Locale;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  numberOfMonths?: number;
  defaultMonth?: Date;
  /** Earliest month the user can navigate to. Bounds the year panel. */
  startMonth?: Date;
  /** Latest month the user can navigate to. */
  endMonth?: Date;
  className?: ClassValue;
  triggerClassName?: ClassValue;
  inputClassName?: ClassValue;
  iconButtonClassName?: ClassValue;
  contentClassName?: ClassValue;
  calendarClassName?: ClassValue;
};

export type DatePickerSingleProps = DatePickerBaseProps & {
  mode?: "single";
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date | undefined) => void;
  /**
   * Render an `<Input />` trigger that supports manual typing in addition to
   * the calendar popover. Only available in `mode="single"`.
   */
  withInput?: boolean;
};

export type DatePickerMultipleProps = DatePickerBaseProps & {
  mode: "multiple";
  value?: Date[];
  defaultValue?: Date[];
  onChange?: (value: Date[] | undefined) => void;
  /** Manual input is single-mode only. */
  withInput?: false;
};

export type DatePickerRangeProps = DatePickerBaseProps & {
  mode: "range";
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  /** Manual input is single-mode only. */
  withInput?: false;
};

export type DatePickerProps =
  | DatePickerSingleProps
  | DatePickerMultipleProps
  | DatePickerRangeProps;

const DEFAULT_FORMAT = "PPP";

const PLACEHOLDERS = {
  single: "Pick a date",
  multiple: "Pick one or more dates",
  range: "Pick a date range",
} as const;

function formatSingle(
  value: Date | undefined,
  fmt: string,
  locale?: Locale
): string {
  if (!(value && isValid(value))) {
    return "";
  }
  return formatDate(value, fmt, { locale });
}

function formatMultiple(
  value: Date[] | undefined,
  fmt: string,
  locale?: Locale
): string {
  if (!value || value.length === 0) {
    return "";
  }
  return value
    .filter((d) => isValid(d))
    .map((d) => formatDate(d, fmt, { locale }))
    .join(", ");
}

function formatRange(
  value: DateRange | undefined,
  fmt: string,
  locale?: Locale
): string {
  if (!(value?.from && isValid(value.from))) {
    return "";
  }
  const from = formatDate(value.from, fmt, { locale });
  if (!(value.to && isValid(value.to))) {
    return `${from} - ...`;
  }
  return `${from} - ${formatDate(value.to, fmt, { locale })}`;
}

type DatePickerValue = Date | Date[] | DateRange | undefined;

type DatePickerCalendarBase = {
  className: string;
  disabled?: boolean;
  endMonth?: Date;
  locale?: Locale;
  numberOfMonths?: number;
  resetViewsKey: number;
  startMonth?: Date;
};

function renderDatePickerCalendar({
  calendarBase,
  commit,
  currentValue,
  defaultMonth,
  mode,
}: {
  calendarBase: DatePickerCalendarBase;
  commit: (next: DatePickerValue) => void;
  currentValue: DatePickerValue;
  defaultMonth?: Date;
  mode: NonNullable<DatePickerProps["mode"]>;
}) {
  if (mode === "multiple") {
    return (
      <Calendar
        {...calendarBase}
        defaultMonth={defaultMonth ?? (currentValue as Date[] | undefined)?.[0]}
        mode="multiple"
        onSelect={(dates) => commit(dates)}
        selected={currentValue as Date[] | undefined}
      />
    );
  }
  if (mode === "range") {
    return (
      <Calendar
        {...calendarBase}
        defaultMonth={
          defaultMonth ?? (currentValue as DateRange | undefined)?.from
        }
        mode="range"
        onSelect={(range) => commit(range)}
        selected={currentValue as DateRange | undefined}
      />
    );
  }
  return (
    <Calendar
      {...calendarBase}
      defaultMonth={defaultMonth ?? (currentValue as Date | undefined)}
      mode="single"
      onSelect={(date) => commit(date)}
      selected={currentValue as Date | undefined}
    />
  );
}

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const {
    mode = "single",
    open,
    defaultOpen,
    onOpenChange,
    format: fmt = DEFAULT_FORMAT,
    locale,
    placeholder,
    disabled,
    numberOfMonths,
    defaultMonth,
    startMonth,
    endMonth,
    className,
    triggerClassName,
    inputClassName,
    iconButtonClassName,
    contentClassName,
    calendarClassName,
  } = props;

  const value = props.value as Date | Date[] | DateRange | undefined;
  const defaultValue = props.defaultValue as
    | Date
    | Date[]
    | DateRange
    | undefined;
  const onChange = props.onChange as
    | ((next: Date | Date[] | DateRange | undefined) => void)
    | undefined;
  const isValueControlled = "value" in props;
  const withInput =
    mode === "single" && (props as DatePickerSingleProps).withInput === true;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const committingDraftRef = useRef(false);
  const skipNextInputBlurRef = useRef(false);
  const contentId = useId();
  const contentSelector = `[data-date-picker-content="${contentId}"]`;

  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const currentOpen = open === undefined ? internalOpen : open;
  const [resetViewsKey, setResetViewsKey] = useState(0);
  const handleOpenChange = (
    next: boolean,
    details?: { reason?: string; event?: Event; cancel?: () => void },
    options?: { commitDraft?: boolean }
  ) => {
    const relatedTarget =
      details?.event && "relatedTarget" in details.event
        ? (details.event as FocusEvent).relatedTarget
        : null;
    if (
      !next &&
      details?.reason === "outside-press" &&
      isTargetWithinPicker(details.event?.target ?? null)
    ) {
      details.cancel?.();
      return;
    }
    if (!next && isTargetWithinPicker(relatedTarget)) {
      details?.cancel?.();
      return;
    }
    if (disabled && next) {
      return;
    }
    if (
      !next &&
      withInput &&
      options?.commitDraft !== false &&
      !committingDraftRef.current
    ) {
      handleInputCommit();
    }
    if (open === undefined) {
      setInternalOpen(next);
    }
    if (!next) {
      setResetViewsKey((k) => k + 1);
    }
    onOpenChange?.(next);
  };

  const [internalValue, setInternalValue] = useState<
    Date | Date[] | DateRange | undefined
  >(defaultValue);
  const currentValue = isValueControlled ? value : internalValue;

  let display: string;
  if (mode === "multiple") {
    display = formatMultiple(currentValue as Date[] | undefined, fmt, locale);
  } else if (mode === "range") {
    display = formatRange(currentValue as DateRange | undefined, fmt, locale);
  } else {
    display = formatSingle(currentValue as Date | undefined, fmt, locale);
  }

  const [draft, setDraft] = useState<string | null>(null);

  const commit = (next: Date | Date[] | DateRange | undefined) => {
    if (disabled) {
      return;
    }
    if (!isValueControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    setDraft(null);
    if (mode === "single" && next) {
      handleOpenChange(false, undefined, { commitDraft: false });
    }
  };

  const handleInputCommit = () => {
    if (draft === null) {
      return;
    }
    committingDraftRef.current = true;
    try {
      if (!draft) {
        commit(undefined);
        setDraft(null);
        return;
      }
      const parsed = parse(draft, fmt, new Date(), { locale });
      if (isValid(parsed)) {
        commit(parsed);
      }
      setDraft(null);
    } finally {
      committingDraftRef.current = false;
    }
  };

  const isTargetWithinPicker = (target: EventTarget | null) => {
    if (!(target instanceof Node)) {
      return false;
    }
    if (wrapperRef.current?.contains(target)) {
      return true;
    }
    return (
      target instanceof Element && target.closest(contentSelector) !== null
    );
  };

  const handlePickerBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (skipNextInputBlurRef.current) {
      skipNextInputBlurRef.current = false;
      return;
    }
    if (isTargetWithinPicker(event.relatedTarget)) {
      return;
    }
    if (currentOpen) {
      return;
    }
    handleInputCommit();
  };

  const handleContentPointerDownCapture = () => {
    skipNextInputBlurRef.current = true;
  };

  const placeholderText = placeholder ?? PLACEHOLDERS[mode];

  const calendarBase = {
    locale,
    className: cn(calendarClassName),
    disabled: disabled || undefined,
    numberOfMonths,
    startMonth,
    endMonth,
    resetViewsKey,
  };

  const calendarNode = renderDatePickerCalendar({
    calendarBase,
    commit,
    currentValue,
    defaultMonth,
    mode,
  });

  if (withInput) {
    return (
      <div className={cn("relative w-60", className)} ref={wrapperRef}>
        <Input
          aria-controls={currentOpen ? contentId : undefined}
          aria-expanded={currentOpen}
          aria-haspopup="dialog"
          className={cn("w-full pr-9", inputClassName, triggerClassName)}
          disabled={disabled}
          onBlur={handlePickerBlur}
          onChange={(e) => setDraft(e.target.value)}
          onClick={() => handleOpenChange(true)}
          onFocus={() => handleOpenChange(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleInputCommit();
            }
          }}
          placeholder={placeholderText}
          value={draft ?? display}
        />
        <Popover onOpenChange={handleOpenChange} open={currentOpen}>
          <PopoverTrigger
            render={
              <Button
                className={cn(
                  "absolute top-1/2 right-0.5 -translate-y-1/2",
                  iconButtonClassName
                )}
                disabled={disabled}
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
            <span className="sr-only">Open calendar</span>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            anchor={wrapperRef}
            className={cn("w-auto p-0", contentClassName)}
            data-date-picker-content={contentId}
            id={contentId}
            initialFocus={false}
            onBlurCapture={handlePickerBlur}
          >
            <div
              onMouseDownCapture={handleContentPointerDownCapture}
              onPointerDownCapture={handleContentPointerDownCapture}
            >
              {calendarNode}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={currentOpen}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "w-60 justify-start font-normal",
              !display && "text-muted-foreground",
              className,
              triggerClassName
            )}
            disabled={disabled}
            variant="outline"
          />
        }
      >
        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
        <span className="truncate">{display || placeholderText}</span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-auto p-0", contentClassName)}
      >
        {calendarNode}
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;

export type { DateRange } from "react-day-picker";
