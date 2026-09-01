import { fireEvent, render, screen, within } from "@testing-library/react";
import { ru } from "date-fns/locale";
import { describe, expect, it, vi } from "vitest";
import { Calendar, type CalendarProps } from "./calendar";

const PREVIOUS_MONTH_NAME = /Go to the Previous Month/i;

describe("Calendar", () => {
  it("preserves primitive caption classes, styles, and animation data", () => {
    render(
      <Calendar
        animate
        classNames={{ month_caption: "consumer-caption" }}
        defaultMonth={new Date(2026, 8, 1)}
        styles={{ month_caption: { color: "rgb(1, 2, 3)" } }}
      />
    );

    const caption = document.querySelector('[data-slot="easy-month-caption"]');
    expect(caption?.getAttribute("class")).toContain("consumer-caption");
    expect(caption?.getAttribute("class")).toContain("relative");
    expect(caption?.getAttribute("data-animated-caption")).toBe("true");
    expect(caption?.getAttribute("style")).toContain("color: rgb(1, 2, 3)");
    expect(caption?.querySelectorAll("button")).toHaveLength(2);
  });

  it("uses resolved explicit and locale labels for custom panel controls", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 8, 1)}
        labels={{ labelMonthDropdown: () => "Explicit month" }}
        locale={{
          labels: {
            labelMonthDropdown: "Locale month",
            labelYearDropdown: "Locale year",
          },
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Explicit month" }));
    expect(
      screen.getByRole("listbox", { name: "Explicit month" })
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Locale year" }));
    expect(screen.getByRole("listbox", { name: "Locale year" })).toBeTruthy();
  });

  it("uses resolved formatters with locale, numerals, and time zone", () => {
    const formatMonthDropdown = vi.fn(
      (date: Date, dateLib?: { formatNumber: (value: number) => string }) =>
        `month-${dateLib?.formatNumber(date.getMonth() + 1)}`
    );
    const formatYearDropdown = vi.fn(
      (date: Date, dateLib?: { formatNumber: (value: number) => string }) =>
        `year-${dateLib?.formatNumber(date.getFullYear())}`
    );

    render(
      <Calendar
        defaultMonth={new Date("2026-09-15T12:00:00.000Z")}
        formatters={{ formatMonthDropdown, formatYearDropdown }}
        locale={{ code: "en-US" }}
        numerals="arab"
        timeZone="UTC"
      />
    );

    const monthTrigger = screen.getByRole("button", {
      name: "Choose the Month",
    });
    const yearTrigger = screen.getByRole("button", {
      name: "Choose the Year",
    });
    expect(monthTrigger.textContent).toBe("month-٩");
    expect(yearTrigger.textContent).toBe("year-٢٠٢٦");

    fireEvent.click(monthTrigger);
    expect(screen.getByRole("option", { name: "month-١" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Choose the Year" }));
    expect(screen.getByRole("option", { name: "year-٢٠٢٦" })).toBeTruthy();
    expect(screen.getByText("year-٢٠٢٠ – year-٢٠٢٩")).toBeTruthy();

    const dateLib = formatYearDropdown.mock.calls.at(-1)?.[1] as
      | { options?: Record<string, unknown> }
      | undefined;
    expect(dateLib?.options).toMatchObject({
      numerals: "arab",
      timeZone: "UTC",
    });
    expect(
      (dateLib?.options?.locale as { code?: string } | undefined)?.code
    ).toBe("en-US");
  });

  it("keeps the default days caption full while month options stay short", () => {
    render(<Calendar defaultMonth={new Date(2026, 0, 1)} />);

    const monthTrigger = screen.getByRole("button", {
      name: "Choose the Month",
    });
    expect(monthTrigger.textContent).toBe("January");

    fireEvent.click(monthTrigger);
    expect(screen.getByRole("option", { name: "Jan" })).toBeTruthy();
  });

  it("preserves contextual full-month grammar in the days caption", () => {
    render(<Calendar defaultMonth={new Date(2026, 0, 1)} locale={ru} />);

    expect(
      screen.getByRole("button", { name: "Choose the Month" }).textContent
    ).toBe("января");
  });

  it("keeps resolved defaults when optional formatters are explicitly undefined", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 0, 1)}
        formatters={{
          formatMonthDropdown: undefined,
          formatYearDropdown: undefined,
        }}
      />
    );

    const monthTrigger = screen.getByRole("button", {
      name: "Choose the Month",
    });
    expect(monthTrigger.textContent).toBe("January");
    expect(
      screen.getByRole("button", { name: "Choose the Year" }).textContent
    ).toBe("2026");

    fireEvent.click(monthTrigger);
    expect(screen.getByRole("option", { name: "Jan" })).toBeTruthy();
  });

  it("strips primitive overrides owned by its custom panel interface", () => {
    const hostileCaption = vi.fn(() => {
      throw new Error("consumer caption formatter executed");
    });
    const hostileComponent = vi.fn(() => {
      throw new Error("consumer component executed");
    });
    const hostileToday = vi.fn(() => {
      throw new Error("consumer date library executed");
    });
    const unsafeProps = {
      captionLayout: "dropdown",
      components: { MonthCaption: hostileComponent },
      "data-slot": "consumer-calendar",
      dateLib: { today: hostileToday },
      fixedWeeks: false,
      formatters: { formatCaption: hostileCaption },
      hideNavigation: false,
    } as unknown as CalendarProps;

    expect(() =>
      render(
        <Calendar
          {...unsafeProps}
          defaultMonth={new Date(2026, 1, 1)}
          defaultView="months"
        />
      )
    ).not.toThrow();

    expect(hostileCaption).not.toHaveBeenCalled();
    expect(hostileComponent).not.toHaveBeenCalled();
    expect(hostileToday).not.toHaveBeenCalled();
    expect(
      document
        .querySelector('[data-slot="calendar"]')
        ?.getAttribute("data-slot")
    ).toBe("calendar");
    expect(
      document.querySelector('[data-slot="consumer-calendar"]')
    ).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Go to the Previous Month" })
    ).toBeNull();
  });

  it("keeps its fixed six-week grid for untyped callers", () => {
    const unsafeProps = { fixedWeeks: false } as unknown as CalendarProps;

    render(<Calendar {...unsafeProps} defaultMonth={new Date(2026, 1, 1)} />);

    expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  });

  it("preserves safe primitive root props and formatters", () => {
    const formatDay = vi.fn((date: Date) => String(date.getDate()));

    render(
      <Calendar
        aria-label="Release calendar"
        className="consumer-calendar"
        defaultMonth={new Date(2026, 1, 1)}
        formatters={{ formatDay }}
        id="release-calendar"
        role="application"
        style={{ color: "rgb(1, 2, 3)" }}
      />
    );

    const root = document.querySelector('[data-slot="calendar"]');
    expect(root?.getAttribute("aria-label")).toBe("Release calendar");
    expect(root?.getAttribute("class")).toContain("consumer-calendar");
    expect(root?.getAttribute("id")).toBe("release-calendar");
    expect(root?.getAttribute("role")).toBe("application");
    expect(root?.getAttribute("style")).toContain("color: rgb(1, 2, 3)");
    expect(formatDay).toHaveBeenCalled();
  });

  it("gives month and year panel navigation buttons accessible names", () => {
    const { unmount } = render(
      <Calendar defaultMonth={new Date(2026, 0, 1)} defaultView="months" />
    );

    expect(screen.getByRole("button", { name: "Previous year" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next year" })).toBeTruthy();

    unmount();
    render(
      <Calendar defaultMonth={new Date(2026, 0, 1)} defaultView="years" />
    );

    expect(
      screen.getByRole("button", { name: "Previous decade" })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next decade" })).toBeTruthy();
  });

  it("uses option semantics for month and year panels", () => {
    const { unmount } = render(
      <Calendar defaultMonth={new Date(2026, 0, 1)} defaultView="months" />
    );

    expect(
      screen.getByRole("option", { name: "Jan" }).getAttribute("aria-selected")
    ).toBe("true");

    unmount();
    render(
      <Calendar defaultMonth={new Date(2026, 0, 1)} defaultView="years" />
    );

    expect(
      screen.getByRole("option", { name: "2026" }).getAttribute("aria-selected")
    ).toBe("true");
  });

  it("enforces startMonth and endMonth in the custom month panel", () => {
    const onMonthChange = vi.fn();

    render(
      <Calendar
        defaultMonth={new Date(2026, 5, 1)}
        defaultView="months"
        endMonth={new Date(2026, 8, 1)}
        onMonthChange={onMonthChange}
        startMonth={new Date(2026, 5, 1)}
      />
    );

    const may = screen.getByRole("option", { name: "May" });
    const jun = screen.getByRole("option", { name: "Jun" });
    const oct = screen.getByRole("option", { name: "Oct" });

    expect((may as HTMLButtonElement).disabled).toBe(true);
    expect((jun as HTMLButtonElement).disabled).toBe(false);
    expect((oct as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(may);
    expect(onMonthChange).not.toHaveBeenCalled();

    fireEvent.click(jun);
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 5, 1));
  });

  it("clamps custom month-panel year navigation to month-level bounds", () => {
    const onMonthChange = vi.fn();

    render(
      <Calendar
        defaultMonth={new Date(2027, 2, 1)}
        defaultView="months"
        onMonthChange={onMonthChange}
        startMonth={new Date(2026, 5, 1)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous year" }));

    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 5, 1));
  });

  it("honors disableNavigation across custom caption and panel controls", () => {
    const onMonthChange = vi.fn();
    const { unmount } = render(
      <Calendar
        defaultMonth={new Date(2026, 0, 1)}
        disableNavigation
        onMonthChange={onMonthChange}
      />
    );

    expect(
      (
        screen.getByRole("button", {
          name: "Choose the Month",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Choose the Year",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);

    unmount();
    render(
      <Calendar
        defaultMonth={new Date(2026, 0, 1)}
        defaultView="months"
        disableNavigation
        onMonthChange={onMonthChange}
      />
    );

    expect(
      (
        screen.getByRole("button", {
          name: "Previous year",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Choose the Year",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Next year",
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    const february = screen.getByRole("option", { name: "Feb" });
    expect((february as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(february);
    expect(onMonthChange).not.toHaveBeenCalled();
  });

  it("separates reverse-month visual indices from chronological offsets", () => {
    const onMonthChange = vi.fn();

    render(
      <Calendar
        defaultMonth={new Date(2026, 0, 1)}
        defaultView="months"
        numberOfMonths={2}
        onMonthChange={onMonthChange}
        reverseMonths
      />
    );

    const firstPanel = screen.getAllByRole("listbox", {
      name: "Choose the Month",
    })[0];
    const february = within(firstPanel).getByRole("option", { name: "Feb" });
    expect(february.getAttribute("aria-selected")).toBe("true");

    fireEvent.click(within(firstPanel).getByRole("option", { name: "Mar" }));
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 1, 1));
  });

  it("keeps controlled month authoritative while emitting one custom navigation change", () => {
    const january = new Date(2026, 0, 1);
    const february = new Date(2026, 1, 1);
    const onMonthChange = vi.fn();
    const { rerender } = render(
      <Calendar
        defaultView="months"
        month={january}
        onMonthChange={onMonthChange}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "Feb" }));

    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(onMonthChange).toHaveBeenCalledWith(february);
    expect(
      screen.getByRole("button", { name: "Choose the Month" }).textContent
    ).toBe("January");

    rerender(<Calendar month={february} onMonthChange={onMonthChange} />);
    expect(
      screen.getByRole("button", { name: "Choose the Month" }).textContent
    ).toBe("February");
  });

  it("reverses all options in the custom year panel", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 0, 1)}
        defaultView="years"
        reverseYears
      />
    );

    expect(
      screen.getAllByRole("option").map((node) => node.textContent)
    ).toEqual([
      "2030",
      "2029",
      "2028",
      "2027",
      "2026",
      "2025",
      "2024",
      "2023",
      "2022",
      "2021",
      "2020",
      "2019",
    ]);
  });

  it("keeps partial previous and next decades reachable", () => {
    const previousChange = vi.fn();
    const { unmount } = render(
      <Calendar
        defaultMonth={new Date(2035, 0, 1)}
        defaultView="years"
        onMonthChange={previousChange}
        startMonth={new Date(2021, 0, 1)}
      />
    );

    const previous = screen.getByRole("button", { name: "Previous decade" });
    expect((previous as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(previous);
    expect(
      (screen.getByRole("option", { name: "2021" }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
    expect(previousChange).toHaveBeenCalledWith(new Date(2025, 0, 1));

    unmount();
    const nextChange = vi.fn();
    render(
      <Calendar
        defaultMonth={new Date(2035, 0, 1)}
        defaultView="years"
        endMonth={new Date(2045, 11, 1)}
        onMonthChange={nextChange}
      />
    );

    const next = screen.getByRole("button", { name: "Next decade" });
    expect((next as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(next);
    expect(
      (screen.getByRole("option", { name: "2045" }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
    expect(nextChange).toHaveBeenCalledWith(new Date(2045, 0, 1));
  });

  it("clamps custom year selection to month-level bounds", () => {
    const startChange = vi.fn();
    const { unmount } = render(
      <Calendar
        defaultMonth={new Date(2027, 2, 1)}
        defaultView="years"
        onMonthChange={startChange}
        startMonth={new Date(2026, 5, 1)}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "2026" }));
    expect(startChange).toHaveBeenCalledWith(new Date(2026, 5, 1));
    expect(
      screen.getByRole("option", { name: "Jun" }).getAttribute("aria-selected")
    ).toBe("true");

    unmount();
    const endChange = vi.fn();
    render(
      <Calendar
        defaultMonth={new Date(2025, 11, 1)}
        defaultView="years"
        endMonth={new Date(2026, 8, 1)}
        onMonthChange={endChange}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "2026" }));
    expect(endChange).toHaveBeenCalledWith(new Date(2026, 8, 1));
    expect(
      screen.getByRole("option", { name: "Sep" }).getAttribute("aria-selected")
    ).toBe("true");
  });

  it("preserves the selected month in a non-local time zone", () => {
    const onMonthChange = vi.fn();

    render(
      <Calendar
        defaultMonth={new Date("2026-01-15T12:00:00.000Z")}
        defaultView="months"
        onMonthChange={onMonthChange}
        timeZone="Pacific/Honolulu"
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "Feb" }));

    const nextMonth = onMonthChange.mock.calls[0]?.[0] as Date | undefined;
    expect(nextMonth?.getFullYear()).toBe(2026);
    expect(nextMonth?.getMonth()).toBe(1);
    expect(
      screen.getByRole("button", { name: "Choose the Month" }).textContent
    ).toBe("February");
  });

  it("uses resolved time-zone dates for year bounds", () => {
    render(
      <Calendar
        defaultMonth={new Date("2026-12-15T12:00:00.000Z")}
        defaultView="years"
        endMonth={new Date("2027-01-01T00:00:00.000Z")}
        timeZone="Pacific/Honolulu"
      />
    );

    expect(
      (screen.getByRole("option", { name: "2027" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it("ignores stale hidden panel views when numberOfMonths shrinks", () => {
    const january = new Date(2026, 0, 1);
    const { rerender } = render(
      <Calendar defaultMonth={january} numberOfMonths={2} />
    );

    const captions = document.querySelectorAll(
      '[data-slot="easy-month-caption"]'
    );
    fireEvent.click(
      within(captions[1] as HTMLElement).getByRole("button", {
        name: "Choose the Month",
      })
    );

    rerender(<Calendar defaultMonth={january} numberOfMonths={1} />);

    expect(
      screen.getByRole("button", { name: PREVIOUS_MONTH_NAME })
    ).toBeTruthy();
  });

  it("ignores stale views when bounds shrink the actual month slots", () => {
    const january = new Date(2026, 0, 1);
    const { rerender } = render(
      <Calendar defaultMonth={january} numberOfMonths={2} />
    );

    const captions = document.querySelectorAll(
      '[data-slot="easy-month-caption"]'
    );
    fireEvent.click(
      within(captions[1] as HTMLElement).getByRole("button", {
        name: "Choose the Month",
      })
    );

    rerender(
      <Calendar
        defaultMonth={january}
        endMonth={january}
        numberOfMonths={2}
        startMonth={january}
      />
    );

    expect(
      screen.getByRole("button", { name: PREVIOUS_MONTH_NAME })
    ).toBeTruthy();
  });

  it("prunes stale views without mounted navigation adapters", () => {
    const january = new Date(2026, 0, 1);
    const { rerender } = render(
      <Calendar defaultMonth={january} navLayout="after" numberOfMonths={2} />
    );

    const captions = document.querySelectorAll(
      '[data-slot="easy-month-caption"]'
    );
    fireEvent.click(
      within(captions[1] as HTMLElement).getByRole("button", {
        name: "Choose the Month",
      })
    );

    rerender(
      <Calendar
        defaultMonth={january}
        endMonth={january}
        navLayout="after"
        numberOfMonths={2}
        startMonth={january}
      />
    );
    rerender(
      <Calendar defaultMonth={january} navLayout="after" numberOfMonths={2} />
    );

    expect(
      screen.queryByRole("listbox", { name: "Choose the Month" })
    ).toBeNull();
  });

  it("uses actual time-zone-resolved month slots for navigation visibility", () => {
    const defaultMonth = new Date("2026-01-15T12:00:00.000Z");
    const { rerender } = render(
      <Calendar
        defaultMonth={defaultMonth}
        numberOfMonths={2}
        timeZone="Pacific/Honolulu"
      />
    );

    const captions = document.querySelectorAll(
      '[data-slot="easy-month-caption"]'
    );
    fireEvent.click(
      within(captions[1] as HTMLElement).getByRole("button", {
        name: "Choose the Month",
      })
    );

    rerender(
      <Calendar
        defaultMonth={defaultMonth}
        endMonth={new Date("2026-02-01T00:30:00.000Z")}
        numberOfMonths={2}
        startMonth={new Date("2026-01-31T23:30:00.000Z")}
        timeZone="Pacific/Honolulu"
      />
    );

    expect(
      screen.getByRole("button", { name: PREVIOUS_MONTH_NAME })
    ).toBeTruthy();
  });

  it("treats resetViewsKey as a post-mount edge-triggered token", () => {
    const { rerender } = render(
      <Calendar
        defaultMonth={new Date(2026, 0, 1)}
        defaultView="months"
        resetViewsKey={1}
      />
    );

    expect(
      screen.getByRole("listbox", { name: "Choose the Month" })
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Choose the Year" }));
    expect(
      screen.getByRole("listbox", { name: "Choose the Year" })
    ).toBeTruthy();

    rerender(
      <Calendar
        defaultMonth={new Date(2026, 0, 1)}
        defaultView="months"
        resetViewsKey={0}
      />
    );

    expect(
      screen.queryByRole("listbox", { name: "Choose the Year" })
    ).toBeNull();
    expect(screen.getByRole("grid")).toBeTruthy();
  });
});
