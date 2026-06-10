import { fireEvent, render, screen } from "@testing-library/react";
import type { DateRange } from "react-day-picker";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  DatePicker,
  type DatePickerMultipleProps,
  type DatePickerProps,
  type DatePickerRangeProps,
  type DatePickerSingleProps,
} from "./date-picker";

const JAN_2026 = new Date(2026, 0, 1);
const JAN_15_2026 = new Date(2026, 0, 15);
const JAN_20_2026 = new Date(2026, 0, 20);

function getDayButton(date: Date) {
  const button = document.querySelector(
    `[data-day="${date.toLocaleDateString()}"]`
  );
  if (!(button instanceof HTMLElement)) {
    throw new Error(`Day button not found: ${date.toLocaleDateString()}`);
  }
  return button;
}

describe("DatePicker", () => {
  it("types mode-specific value callbacks", () => {
    expectTypeOf<DatePickerSingleProps["value"]>().toEqualTypeOf<
      Date | undefined
    >();
    expectTypeOf<
      Parameters<NonNullable<DatePickerSingleProps["onChange"]>>[0]
    >().toEqualTypeOf<Date | undefined>();
    expectTypeOf<DatePickerMultipleProps["value"]>().toEqualTypeOf<
      Date[] | undefined
    >();
    expectTypeOf<
      Parameters<NonNullable<DatePickerMultipleProps["onChange"]>>[0]
    >().toEqualTypeOf<Date[] | undefined>();
    expectTypeOf<DatePickerRangeProps["value"]>().toEqualTypeOf<
      DateRange | undefined
    >();
  });

  it("rejects input mode for multiple and range props at compile time", () => {
    const validSingle: DatePickerProps = { withInput: true };
    const invalidMultiple: DatePickerMultipleProps = {
      mode: "multiple",
      // @ts-expect-error manual input is single-mode only.
      withInput: true,
    };
    const invalidRange: DatePickerRangeProps = {
      mode: "range",
      // @ts-expect-error manual input is single-mode only.
      withInput: true,
    };

    expect(validSingle).toBeDefined();
    expect(invalidMultiple).toBeDefined();
    expect(invalidRange).toBeDefined();
  });

  it("keeps value={undefined} controlled instead of mutating internal state", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        defaultMonth={JAN_2026}
        defaultOpen
        format="MM/dd/yyyy"
        onChange={onChange}
        value={undefined}
      />
    );

    fireEvent.click(getDayButton(JAN_15_2026));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual(JAN_15_2026);
    expect(screen.getByRole("button", { name: "Pick a date" })).toBeTruthy();
    expect(screen.queryByText("01/15/2026")).toBeNull();
  });

  it("does not crash when external values contain invalid dates", () => {
    render(
      <DatePicker
        mode="multiple"
        placeholder="Pick dates"
        value={[new Date(Number.NaN)]}
      />
    );

    expect(screen.getByRole("button", { name: "Pick dates" })).toBeTruthy();
  });

  it("does not commit calendar selections while disabled", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        defaultMonth={JAN_2026}
        defaultOpen
        disabled
        onChange={onChange}
      />
    );

    fireEvent.click(getDayButton(JAN_15_2026));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Pick a date" })).toBeTruthy();
  });

  it("commits a valid typed single date on Enter", () => {
    const onChange = vi.fn();

    render(<DatePicker format="MM/dd/yyyy" onChange={onChange} withInput />);

    const input = screen.getByPlaceholderText(
      "Pick a date"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "01/15/2026" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual(JAN_15_2026);
    expect(input.value).toBe("01/15/2026");
  });

  it("lets calendar selection win over a pending valid input draft", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        defaultMonth={JAN_2026}
        defaultOpen
        format="yyyy-MM-dd"
        onChange={onChange}
        withInput
      />
    );

    const input = screen.getByPlaceholderText(
      "Pick a date"
    ) as HTMLInputElement;

    input.focus();
    fireEvent.change(input, { target: { value: "2026-01-01" } });
    const day = getDayButton(JAN_15_2026);
    fireEvent.click(day);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual(JAN_15_2026);
  });

  it("discards invalid typed input on blur", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        defaultValue={JAN_15_2026}
        format="MM/dd/yyyy"
        onChange={onChange}
        withInput
      />
    );

    const input = screen.getByDisplayValue("01/15/2026") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "not a date" } });
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe("01/15/2026");
  });

  it("clears single input when the typed draft is emptied", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        defaultValue={JAN_15_2026}
        format="MM/dd/yyyy"
        onChange={onChange}
        withInput
      />
    );

    const input = screen.getByDisplayValue("01/15/2026") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(input.value).toBe("");
  });

  it("formats partial and complete ranges", () => {
    const { rerender } = render(
      <DatePicker
        format="MM/dd/yyyy"
        mode="range"
        value={{ from: JAN_15_2026 }}
      />
    );

    expect(
      screen.getByRole("button", { name: "01/15/2026 - ..." })
    ).toBeTruthy();

    rerender(
      <DatePicker
        format="MM/dd/yyyy"
        mode="range"
        value={{ from: JAN_15_2026, to: JAN_20_2026 }}
      />
    );

    expect(
      screen.getByRole("button", { name: "01/15/2026 - 01/20/2026" })
    ).toBeTruthy();
  });
});
