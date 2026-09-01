import { fireEvent, render, screen } from "@testing-library/react";
import { ru } from "date-fns/locale";
import { describe, expect, it, vi } from "vitest";
import { Calendar, type CalendarProps } from "./calendar";

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
});
