import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar", () => {
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
