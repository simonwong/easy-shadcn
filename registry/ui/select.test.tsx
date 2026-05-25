import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  Select,
  type SelectMultipleProps,
  type SelectSingleProps,
} from "./select";

const ITEMS = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

function hoverAdornment(container: HTMLElement) {
  const adornment = container.querySelector("[data-select-adornment]");
  if (!adornment) {
    throw new Error("Select adornment not found");
  }
  fireEvent.mouseEnter(adornment);
}

describe("Select", () => {
  it("types single value callbacks as string or undefined", () => {
    expectTypeOf<SelectSingleProps["value"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<
      Parameters<NonNullable<SelectSingleProps["onValueChange"]>>[0]
    >().toEqualTypeOf<string | undefined>();
  });

  it("types multiple value callbacks as string arrays", () => {
    expectTypeOf<SelectMultipleProps["value"]>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<
      Parameters<NonNullable<SelectMultipleProps["onValueChange"]>>[0]
    >().toEqualTypeOf<string[]>();
  });

  it("rejects mismatched single and multiple value shapes at compile time", () => {
    // @ts-expect-error single mode does not accept array values.
    const invalidSingle: SelectSingleProps = { items: ITEMS, value: ["apple"] };
    const invalidMultiple: SelectMultipleProps = {
      items: ITEMS,
      multiple: true,
      // @ts-expect-error multiple mode change handler receives string[].
      onValueChange: (_value: string) => _value.length,
    };

    expect(invalidSingle).toBeDefined();
    expect(invalidMultiple).toBeDefined();
  });

  it("clears a controlled single select to undefined", () => {
    const onValueChange = vi.fn();

    function ControlledSelect() {
      const [value, setValue] = useState<string | undefined>("apple");
      return (
        <Select
          clearable
          items={ITEMS}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
          placeholder="Pick fruit"
          value={value}
        />
      );
    }

    const { container } = render(<ControlledSelect />);

    expect(screen.getByText("Apple")).toBeTruthy();
    hoverAdornment(container);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(screen.getByText("Pick fruit")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("keeps the searchable clear button inside a stable adornment frame", () => {
    const { container } = render(
      <Select clearable items={ITEMS} searchable value="apple" />
    );

    hoverAdornment(container);

    const adornment = container.querySelector("[data-select-adornment]");
    if (!adornment) {
      throw new Error("Select adornment not found");
    }

    const directChildren = Array.from(adornment.children);
    expect(
      directChildren.some((child) => child.tagName.toLowerCase() === "button")
    ).toBe(false);
    expect(directChildren[0]?.hasAttribute("data-select-adornment-frame")).toBe(
      true
    );
  });

  it("clears a controlled multiple select to an empty array", () => {
    const onValueChange = vi.fn();

    const { container } = render(
      <Select
        clearable
        items={ITEMS}
        multiple
        onValueChange={onValueChange}
        placeholder="Pick fruit"
        value={["apple", "banana"]}
      />
    );

    hoverAdornment(container);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("shows the selected label in searchable single mode", () => {
    render(
      <Select
        items={ITEMS}
        placeholder="Pick fruit"
        searchable
        value="banana"
      />
    );

    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe(
      "Banana"
    );
  });
});
