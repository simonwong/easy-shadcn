"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ClassValue } from "clsx";
import type { Locale as DateFnsLocale } from "date-fns";
import { addMonths, format } from "date-fns";
import type React from "react";
import {
  createContext,
  type HTMLAttributes,
  type TableHTMLAttributes,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CalendarMonth } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export type CalendarView = "days" | "months" | "years";

const MONTH_INDICES = Array.from({ length: 12 }, (_, i) => i);
const DECADE_SIZE = 10;

type CalendarPrimitiveProps = React.ComponentProps<typeof CalendarPrimitive>;

export type CalendarProps = CalendarPrimitiveProps & {
  defaultView?: CalendarView;
  monthsClassName?: ClassValue;
  yearsClassName?: ClassValue;
  /** Reset all per-month views to "days". Bump this value to trigger a reset. */
  resetViewsKey?: number;
};

type CaptionCtxValue = {
  locale: CalendarPrimitiveProps["locale"];
  views: Record<number, CalendarView>;
  setViewForIndex: (index: number, view: CalendarView) => void;
  startYear: number;
  endYear: number;
  currentMonth: Date;
  handleMonthChange: (date: Date) => void;
  monthsClassName?: ClassValue;
  yearsClassName?: ClassValue;
};

const CaptionCtx = createContext<CaptionCtxValue | null>(null);
const MonthIndexCtx = createContext<number>(0);

function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
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
  calendarMonth: _calendarMonth,
  displayIndex,
  children,
  ...rest
}: MonthSlotProps) {
  return (
    <MonthIndexCtx.Provider value={displayIndex}>
      <div data-slot="easy-month" {...rest}>
        {children}
      </div>
    </MonthIndexCtx.Provider>
  );
}

type MonthCaptionProps = {
  calendarMonth: CalendarMonth;
  displayIndex: number;
} & HTMLAttributes<HTMLDivElement>;

function MonthCaption({ calendarMonth, displayIndex }: MonthCaptionProps) {
  const ctx = useContext(CaptionCtx)!;
  const view = ctx.views[displayIndex] ?? "days";
  const setView = (v: CalendarView) => ctx.setViewForIndex(displayIndex, v);
  const fmtLocale = { locale: ctx.locale as DateFnsLocale };

  const yr = calendarMonth.date.getFullYear();
  const mo = calendarMonth.date.getMonth();
  const decadeStart = Math.floor(yr / DECADE_SIZE) * DECADE_SIZE;

  const changeYear = (delta: number) => {
    const next = yr + delta;
    if (next < ctx.startYear || next > ctx.endYear) {
      return;
    }
    ctx.handleMonthChange(new Date(next, mo - displayIndex, 1));
  };

  const changeDecade = (delta: number) => {
    ctx.handleMonthChange(
      new Date(yr + delta * DECADE_SIZE, mo - displayIndex, 1)
    );
  };

  let content: React.ReactNode;
  if (view === "months") {
    content = (
      <>
        <NavButton
          direction="left"
          disabled={yr <= ctx.startYear}
          onClick={() => changeYear(-1)}
        />
        <Button
          className="font-medium text-sm"
          onClick={() => setView("years")}
          size="sm"
          variant="ghost"
        >
          {format(new Date(yr, 0, 1), "yyyy", fmtLocale)}
        </Button>
        <NavButton
          direction="right"
          disabled={yr >= ctx.endYear}
          onClick={() => changeYear(1)}
        />
      </>
    );
  } else if (view === "years") {
    content = (
      <>
        <NavButton
          direction="left"
          disabled={decadeStart - DECADE_SIZE < ctx.startYear}
          onClick={() => changeDecade(-1)}
        />
        <span className="select-none font-medium text-sm">
          {decadeStart} – {decadeStart + DECADE_SIZE - 1}
        </span>
        <NavButton
          direction="right"
          disabled={decadeStart + DECADE_SIZE * 2 > ctx.endYear}
          onClick={() => changeDecade(1)}
        />
      </>
    );
  } else {
    content = (
      <>
        <Button
          className="font-medium text-sm"
          onClick={() => setView("months")}
          size="sm"
          variant="ghost"
        >
          {format(calendarMonth.date, "MMMM", fmtLocale)}
        </Button>
        <Button
          className="font-medium text-sm"
          onClick={() => setView("years")}
          size="sm"
          variant="ghost"
        >
          {format(calendarMonth.date, "yyyy", fmtLocale)}
        </Button>
      </>
    );
  }

  return (
    <div
      className={cn(
        "relative z-10 flex h-(--cell-size) w-full items-center [&_button]:pointer-events-auto",
        view === "days"
          ? "pointer-events-none justify-center gap-0.5 px-(--cell-size)"
          : "justify-between"
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
  const displayIndex = useContext(MonthIndexCtx);
  const view = ctx.views[displayIndex] ?? "days";

  if (view === "days") {
    return (
      <table className={className} {...rest}>
        {children}
      </table>
    );
  }

  const monthDate = addMonths(ctx.currentMonth, displayIndex);
  const yr = monthDate.getFullYear();
  const mo = monthDate.getMonth();
  const decadeStart = Math.floor(yr / DECADE_SIZE) * DECADE_SIZE;
  const fmtLocale = { locale: ctx.locale as DateFnsLocale };

  const setView = (v: CalendarView) => ctx.setViewForIndex(displayIndex, v);
  const selectMonth = (m: number) => {
    ctx.handleMonthChange(new Date(yr, m - displayIndex, 1));
    setView("days");
  };
  const selectYear = (y: number) => {
    ctx.handleMonthChange(new Date(y, mo - displayIndex, 1));
    setView("months");
  };

  if (view === "months") {
    return (
      <div
        aria-label="Choose month"
        className={cn(
          "grid w-full flex-1 grid-cols-3 content-center gap-2 px-1",
          ctx.monthsClassName
        )}
        data-slot="easy-month-panel"
        role="listbox"
      >
        {MONTH_INDICES.map((m) => {
          const label = format(new Date(yr, m, 1), "MMM", fmtLocale);
          return (
            <Button
              className="h-8"
              key={m}
              onClick={() => selectMonth(m)}
              size="sm"
              variant={m === mo ? "default" : "ghost"}
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

  return (
    <div
      aria-label="Choose year"
      className={cn(
        "grid w-full flex-1 grid-cols-3 content-center gap-2 px-1",
        ctx.yearsClassName
      )}
      data-slot="easy-year-panel"
      role="listbox"
    >
      {decadeYears.map((y) => {
        const isOutside = y < decadeStart || y > decadeStart + DECADE_SIZE - 1;
        const isCurrent = y === yr;
        const isDisabled = y < ctx.startYear || y > ctx.endYear;
        return (
          <Button
            className={cn("h-8", isOutside && "text-muted-foreground")}
            disabled={isDisabled}
            key={y}
            onClick={() => selectYear(y)}
            size="sm"
            variant={isCurrent ? "default" : "ghost"}
          >
            {y}
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
};

export const Calendar = (props: CalendarProps) => {
  const {
    className,
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
    style,
    ...rest
  } = props;

  const [views, setViews] = useState<Record<number, CalendarView>>(
    defaultView ? { 0: defaultView } : {}
  );
  const setViewForIndex = (index: number, view: CalendarView) => {
    setViews((prev) => ({ ...prev, [index]: view }));
  };

  useEffect(() => {
    if (resetViewsKey) {
      setViews({});
    }
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

  const [nowYear] = useState(() => new Date().getFullYear());
  const startYear = startMonth?.getFullYear() ?? nowYear - 100;
  const endYear = endMonth?.getFullYear() ?? nowYear + 100;

  const anyPanelOpen = Object.values(views).some((v) => v && v !== "days");

  return (
    <CaptionCtx.Provider
      value={{
        currentMonth,
        endYear,
        handleMonthChange,
        locale,
        monthsClassName,
        setViewForIndex,
        startYear,
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
        hideNavigation={anyPanelOpen}
        locale={locale}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        startMonth={startMonth}
        style={{ "--cell-size": "32px", ...style } as React.CSSProperties}
      />
    </CaptionCtx.Provider>
  );
};

export default Calendar;
