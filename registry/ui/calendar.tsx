"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ClassValue } from "clsx";
import type React from "react";
import {
  type ButtonHTMLAttributes,
  createContext,
  type HTMLAttributes,
  type TableHTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type CalendarMonth,
  DateLib,
  Months as DayPickerMonths,
  Nav as DayPickerNav,
  NextMonthButton as DayPickerNextMonthButton,
  PreviousMonthButton as DayPickerPreviousMonthButton,
  defaultLocale,
  type NavProps,
  useDayPicker,
} from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export type CalendarView = "days" | "months" | "years";

const MONTH_INDICES = Array.from({ length: 12 }, (_, i) => i);
const DECADE_SIZE = 10;

type CalendarPrimitiveProps = React.ComponentProps<typeof CalendarPrimitive>;

interface CalendarOwnedPrimitiveProps {
  captionLayout?: never;
  components?: never;
  "data-slot"?: never;
  dateLib?: never;
  fixedWeeks?: never;
  hideNavigation?: never;
}

type CalendarFormatterProps = Omit<
  NonNullable<CalendarPrimitiveProps["formatters"]>,
  "formatCaption"
> & {
  formatCaption?: never;
};

type CalendarSafePrimitiveProps<T> = T extends unknown
  ? Omit<T, keyof CalendarOwnedPrimitiveProps | "formatters"> &
      CalendarOwnedPrimitiveProps & {
        formatters?: CalendarFormatterProps;
      }
  : never;

export type CalendarProps =
  CalendarSafePrimitiveProps<CalendarPrimitiveProps> & {
    defaultView?: CalendarView;
    monthsClassName?: ClassValue;
    yearsClassName?: ClassValue;
    /** Reset all per-month views to "days". Bump this value to trigger a reset. */
    resetViewsKey?: number;
  };

type CaptionCtxValue = {
  views: Record<number, CalendarView>;
  setViewForIndex: (index: number, view: CalendarView) => void;
  pruneViews: (activeCount: number) => void;
  hasCustomMonthFormatter: boolean;
  monthsClassName?: ClassValue;
  yearsClassName?: ClassValue;
};

type MonthSlotCtxValue = {
  calendarMonth: CalendarMonth;
  displayIndex: number;
};

const CaptionCtx = createContext<CaptionCtxValue | null>(null);
const MonthSlotCtx = createContext<MonthSlotCtxValue | null>(null);

function clampMonth(
  date: Date,
  dateLib: DateLib,
  startMonth?: Date,
  endMonth?: Date
) {
  if (startMonth && dateLib.differenceInCalendarMonths(date, startMonth) < 0) {
    return dateLib.startOfMonth(startMonth);
  }
  if (endMonth && dateLib.differenceInCalendarMonths(date, endMonth) > 0) {
    return dateLib.startOfMonth(endMonth);
  }
  return dateLib.startOfMonth(date);
}

function getMonthOffset(
  displayIndex: number,
  monthCount: number,
  reverseMonths?: boolean
) {
  return reverseMonths ? monthCount - 1 - displayIndex : displayIndex;
}

function useCalendarDateLib(dayPickerProps: CalendarPrimitiveProps) {
  return useMemo(
    () =>
      new DateLib({
        firstWeekContainsDate: dayPickerProps.firstWeekContainsDate,
        locale: { ...defaultLocale, ...dayPickerProps.locale },
        numerals: dayPickerProps.numerals,
        timeZone: dayPickerProps.timeZone,
        useAdditionalDayOfYearTokens:
          dayPickerProps.useAdditionalDayOfYearTokens,
        useAdditionalWeekYearTokens: dayPickerProps.useAdditionalWeekYearTokens,
        weekStartsOn: dayPickerProps.broadcastCalendar
          ? 1
          : dayPickerProps.weekStartsOn,
      }),
    [
      dayPickerProps.broadcastCalendar,
      dayPickerProps.firstWeekContainsDate,
      dayPickerProps.locale,
      dayPickerProps.numerals,
      dayPickerProps.timeZone,
      dayPickerProps.useAdditionalDayOfYearTokens,
      dayPickerProps.useAdditionalWeekYearTokens,
      dayPickerProps.weekStartsOn,
    ]
  );
}

function useCalendarFormatting() {
  const { dayPickerProps, formatters, labels } = useDayPicker();
  const dateLib = useCalendarDateLib(dayPickerProps);

  return { dateLib, formatters, labels };
}

function useHasOpenPanel() {
  const ctx = useContext(CaptionCtx)!;
  const { months } = useDayPicker();
  return Object.entries(ctx.views).some(
    ([index, view]) => Number(index) < months.length && view !== "days"
  );
}

function CalendarMonths(props: HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(CaptionCtx)!;
  const { months } = useDayPicker();
  useEffect(
    () => ctx.pruneViews(months.length),
    [ctx.pruneViews, months.length]
  );
  return <DayPickerMonths {...props} />;
}

function CalendarNav(props: NavProps) {
  if (useHasOpenPanel()) {
    return <span hidden />;
  }
  return <DayPickerNav {...props} />;
}

function CalendarPreviousMonthButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  if (useHasOpenPanel()) {
    return <span hidden />;
  }
  return <DayPickerPreviousMonthButton {...props} />;
}

function CalendarNextMonthButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  if (useHasOpenPanel()) {
    return <span hidden />;
  }
  return <DayPickerNextMonthButton {...props} />;
}

function NavButton({
  "aria-label": ariaLabel,
  direction,
  disabled,
  onClick,
}: {
  "aria-label": string;
  direction: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      size="icon-sm"
      variant="ghost"
    >
      <HugeiconsIcon
        className="size-4"
        icon={direction === "left" ? ArrowLeftIcon : ArrowRightIcon}
        strokeWidth={2}
      />
    </Button>
  );
}

type MonthSlotProps = {
  calendarMonth: CalendarMonth;
  displayIndex: number;
} & HTMLAttributes<HTMLDivElement>;

function MonthSlot({
  calendarMonth,
  displayIndex,
  children,
  ...rest
}: MonthSlotProps) {
  return (
    <MonthSlotCtx.Provider value={{ calendarMonth, displayIndex }}>
      <div data-slot="easy-month" {...rest}>
        {children}
      </div>
    </MonthSlotCtx.Provider>
  );
}

type MonthCaptionProps = {
  calendarMonth: CalendarMonth;
  "data-slot"?: string;
  "data-view"?: string;
  displayIndex: number;
} & HTMLAttributes<HTMLDivElement>;

function MonthCaption({
  calendarMonth,
  children: _ignoredChildren,
  className,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  "data-slot": _ignoredDataSlot,
  "data-view": _ignoredDataView,
  displayIndex,
  ...captionProps
}: MonthCaptionProps) {
  const ctx = useContext(CaptionCtx)!;
  const { dateLib, formatters, labels } = useCalendarFormatting();
  const { dayPickerProps, goToMonth, months } = useDayPicker();
  const view = ctx.views[displayIndex] ?? "days";
  const setView = (v: CalendarView) => ctx.setViewForIndex(displayIndex, v);
  const navigationDisabled = Boolean(dayPickerProps.disableNavigation);
  const startYear = dayPickerProps.startMonth
    ? dateLib.getYear(dayPickerProps.startMonth)
    : dateLib.getYear(dateLib.today()) - 100;
  const endYear = dayPickerProps.endMonth
    ? dateLib.getYear(dayPickerProps.endMonth)
    : dateLib.getYear(dateLib.today()) + 100;
  const monthOffset = getMonthOffset(
    displayIndex,
    months.length,
    dayPickerProps.reverseMonths
  );

  const yr = dateLib.getYear(calendarMonth.date);
  const decadeStart = Math.floor(yr / DECADE_SIZE) * DECADE_SIZE;
  const monthLabel = labels.labelMonthDropdown(dateLib.options);
  const yearLabel = labels.labelYearDropdown(dateLib.options);
  const formatYear = (year: number) =>
    formatters.formatYearDropdown(dateLib.newDate(year, 0, 1), dateLib);
  const navigateToPanelMonth = (date: Date) => {
    if (navigationDisabled) {
      return;
    }
    const nextPanelMonth = clampMonth(
      date,
      dateLib,
      dayPickerProps.startMonth,
      dayPickerProps.endMonth
    );
    goToMonth(dateLib.addMonths(nextPanelMonth, -monthOffset));
  };

  const changeYear = (delta: number) => {
    const next = yr + delta;
    if (next < startYear || next > endYear) {
      return;
    }
    navigateToPanelMonth(dateLib.setYear(calendarMonth.date, next));
  };

  const changeDecade = (delta: number) => {
    navigateToPanelMonth(
      dateLib.setYear(calendarMonth.date, yr + delta * DECADE_SIZE)
    );
  };

  let content: React.ReactNode;
  if (view === "months") {
    content = (
      <>
        <NavButton
          aria-label="Previous year"
          direction="left"
          disabled={navigationDisabled || yr <= startYear}
          onClick={() => changeYear(-1)}
        />
        <Button
          aria-label={yearLabel}
          className="font-medium text-sm"
          disabled={navigationDisabled}
          onClick={() => setView("years")}
          size="sm"
          variant="ghost"
        >
          {formatYear(yr)}
        </Button>
        <NavButton
          aria-label="Next year"
          direction="right"
          disabled={navigationDisabled || yr >= endYear}
          onClick={() => changeYear(1)}
        />
      </>
    );
  } else if (view === "years") {
    content = (
      <>
        <NavButton
          aria-label="Previous decade"
          direction="left"
          disabled={navigationDisabled || decadeStart <= startYear}
          onClick={() => changeDecade(-1)}
        />
        <span className="select-none font-medium text-sm">
          {formatYear(decadeStart)} –{" "}
          {formatYear(decadeStart + DECADE_SIZE - 1)}
        </span>
        <NavButton
          aria-label="Next decade"
          direction="right"
          disabled={navigationDisabled || decadeStart + DECADE_SIZE > endYear}
          onClick={() => changeDecade(1)}
        />
      </>
    );
  } else {
    content = (
      <>
        <Button
          aria-label={monthLabel}
          className="font-medium text-sm"
          disabled={navigationDisabled}
          onClick={() => setView("months")}
          size="sm"
          variant="ghost"
        >
          {ctx.hasCustomMonthFormatter
            ? formatters.formatMonthDropdown(calendarMonth.date, dateLib)
            : dateLib.format(calendarMonth.date, "MMMM")}
        </Button>
        <Button
          aria-label={yearLabel}
          className="font-medium text-sm"
          disabled={navigationDisabled}
          onClick={() => setView("years")}
          size="sm"
          variant="ghost"
        >
          {formatters.formatYearDropdown(calendarMonth.date, dateLib)}
        </Button>
      </>
    );
  }

  return (
    <div
      {...captionProps}
      className={cn(
        "relative z-10 flex h-(--cell-size) w-full items-center [&_button]:pointer-events-auto",
        view === "days"
          ? "pointer-events-none justify-center gap-0.5 px-(--cell-size)"
          : "justify-between",
        className
      )}
      data-slot="easy-month-caption"
      data-view={view}
    >
      {content}
    </div>
  );
}

function MonthGrid({
  children,
  className,
  ...rest
}: TableHTMLAttributes<HTMLTableElement>) {
  const ctx = useContext(CaptionCtx)!;
  const { dateLib, formatters, labels } = useCalendarFormatting();
  const { dayPickerProps, goToMonth, months } = useDayPicker();
  const { calendarMonth, displayIndex } = useContext(MonthSlotCtx)!;
  const view = ctx.views[displayIndex] ?? "days";

  if (view === "days") {
    return (
      <table className={className} {...rest}>
        {children}
      </table>
    );
  }

  const monthDate = calendarMonth.date;
  const yr = dateLib.getYear(monthDate);
  const mo = dateLib.getMonth(monthDate);
  const decadeStart = Math.floor(yr / DECADE_SIZE) * DECADE_SIZE;
  const monthLabel = labels.labelMonthDropdown(dateLib.options);
  const yearLabel = labels.labelYearDropdown(dateLib.options);

  const setView = (v: CalendarView) => ctx.setViewForIndex(displayIndex, v);
  const navigationDisabled = Boolean(dayPickerProps.disableNavigation);
  const startYear = dayPickerProps.startMonth
    ? dateLib.getYear(dayPickerProps.startMonth)
    : dateLib.getYear(dateLib.today()) - 100;
  const endYear = dayPickerProps.endMonth
    ? dateLib.getYear(dayPickerProps.endMonth)
    : dateLib.getYear(dateLib.today()) + 100;
  const monthOffset = getMonthOffset(
    displayIndex,
    months.length,
    dayPickerProps.reverseMonths
  );
  const navigateToPanelMonth = (date: Date) => {
    if (navigationDisabled) {
      return;
    }
    const nextPanelMonth = clampMonth(
      date,
      dateLib,
      dayPickerProps.startMonth,
      dayPickerProps.endMonth
    );
    goToMonth(dateLib.addMonths(nextPanelMonth, -monthOffset));
  };
  const isMonthDisabled = (m: number) => {
    if (navigationDisabled) {
      return true;
    }
    const value = dateLib.newDate(yr, m, 1);
    if (
      dayPickerProps.startMonth &&
      dateLib.differenceInCalendarMonths(value, dayPickerProps.startMonth) < 0
    ) {
      return true;
    }
    if (
      dayPickerProps.endMonth &&
      dateLib.differenceInCalendarMonths(value, dayPickerProps.endMonth) > 0
    ) {
      return true;
    }
    return false;
  };
  const selectMonth = (m: number) => {
    if (isMonthDisabled(m)) {
      return;
    }
    navigateToPanelMonth(dateLib.setMonth(monthDate, m));
    setView("days");
  };
  const selectYear = (y: number) => {
    if (navigationDisabled) {
      return;
    }
    navigateToPanelMonth(dateLib.setYear(monthDate, y));
    setView("months");
  };

  if (view === "months") {
    return (
      <div
        aria-label={monthLabel}
        className={cn(
          "grid w-full flex-1 grid-cols-3 content-center gap-2 px-1",
          ctx.monthsClassName
        )}
        data-slot="easy-month-panel"
        role="listbox"
      >
        {MONTH_INDICES.map((m) => {
          const label = formatters.formatMonthDropdown(
            dateLib.newDate(yr, m, 1),
            dateLib
          );
          const isCurrent = m === mo;
          const isDisabled = isMonthDisabled(m);
          return (
            <Button
              aria-selected={isCurrent}
              className="h-8"
              disabled={isDisabled}
              key={m}
              onClick={() => selectMonth(m)}
              role="option"
              size="sm"
              variant={isCurrent ? "default" : "ghost"}
            >
              {label}
            </Button>
          );
        })}
      </div>
    );
  }

  const decadeYears = Array.from(
    { length: DECADE_SIZE + 2 },
    (_, i) => decadeStart - 1 + i
  );
  if (dayPickerProps.reverseYears) {
    decadeYears.reverse();
  }

  return (
    <div
      aria-label={yearLabel}
      className={cn(
        "grid w-full flex-1 grid-cols-3 content-center gap-2 px-1",
        ctx.yearsClassName
      )}
      data-slot="easy-year-panel"
      role="listbox"
    >
      {decadeYears.map((y) => {
        const label = formatters.formatYearDropdown(
          dateLib.newDate(y, mo, 1),
          dateLib
        );
        const isOutside = y < decadeStart || y > decadeStart + DECADE_SIZE - 1;
        const isCurrent = y === yr;
        const isDisabled = navigationDisabled || y < startYear || y > endYear;
        return (
          <Button
            aria-selected={isCurrent}
            className={cn("h-8", isOutside && "text-muted-foreground")}
            disabled={isDisabled}
            key={y}
            onClick={() => selectYear(y)}
            role="option"
            size="sm"
            variant={isCurrent ? "default" : "ghost"}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

const calendarComponents = {
  Month: MonthSlot,
  MonthCaption,
  MonthGrid,
  Months: CalendarMonths,
  Nav: CalendarNav,
  NextMonthButton: CalendarNextMonthButton,
  PreviousMonthButton: CalendarPreviousMonthButton,
};

export const Calendar = (props: CalendarProps) => {
  const {
    captionLayout: _ignoredCaptionLayout,
    className,
    components: _ignoredComponents,
    "data-slot": _ignoredDataSlot,
    dateLib: _ignoredDateLib,
    fixedWeeks: _ignoredFixedWeeks,
    formatters,
    hideNavigation: _ignoredHideNavigation,
    monthsClassName,
    yearsClassName,
    defaultView,
    resetViewsKey,
    locale,
    startMonth,
    endMonth,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    style,
    ...rest
  } = props;
  const { formatCaption: _ignoredFormatCaption, ...formatterOverrides } =
    formatters ?? {};
  const safeFormatters = Object.fromEntries(
    Object.entries(formatterOverrides).filter(
      ([, formatter]) => formatter !== undefined
    )
  ) as CalendarFormatterProps;
  const [views, setViews] = useState<Record<number, CalendarView>>(
    defaultView ? { 0: defaultView } : {}
  );
  const setViewForIndex = (index: number, view: CalendarView) => {
    setViews((prev) => ({ ...prev, [index]: view }));
  };
  const pruneViews = useCallback((activeCount: number) => {
    setViews((previous) => {
      const next = Object.fromEntries(
        Object.entries(previous).filter(
          ([index]) => Number(index) < activeCount
        )
      );
      return Object.keys(next).length === Object.keys(previous).length
        ? previous
        : next;
    });
  }, []);

  const previousResetViewsKey = useRef(resetViewsKey);
  useEffect(() => {
    if (Object.is(previousResetViewsKey.current, resetViewsKey)) {
      return;
    }
    previousResetViewsKey.current = resetViewsKey;
    setViews({});
  }, [resetViewsKey]);

  const [internalMonth, setInternalMonth] = useState(
    controlledMonth ?? defaultMonth ?? new Date()
  );
  const currentMonth = controlledMonth ?? internalMonth;
  const handleMonthChange = (next: Date) => {
    if (controlledMonth === undefined) {
      setInternalMonth(next);
    }
    onMonthChange?.(next);
  };

  return (
    <CaptionCtx.Provider
      value={{
        hasCustomMonthFormatter:
          safeFormatters.formatMonthDropdown !== undefined,
        monthsClassName,
        pruneViews,
        setViewForIndex,
        views,
        yearsClassName,
      }}
    >
      <CalendarPrimitive
        {...(rest as CalendarPrimitiveProps)}
        captionLayout="label"
        className={cn(
          "[&_[data-slot=easy-month]]:min-h-[calc(var(--cell-size)*10+0.5rem)] [&_[data-slot=easy-month]]:w-[calc(var(--cell-size)*7)]",
          className
        )}
        components={calendarComponents}
        endMonth={endMonth}
        fixedWeeks
        formatters={safeFormatters}
        locale={locale}
        month={currentMonth}
        numberOfMonths={numberOfMonths}
        onMonthChange={handleMonthChange}
        startMonth={startMonth}
        style={{ "--cell-size": "32px", ...style } as React.CSSProperties}
      />
    </CaptionCtx.Provider>
  );
};

export default Calendar;
