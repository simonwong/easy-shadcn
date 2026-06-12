import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act, useState } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  Select,
  type SelectItem,
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

  it("shows the clear button on focus without requiring hover", () => {
    const { container } = render(
      <Select clearable items={ITEMS} placeholder="Pick fruit" value="apple" />
    );

    const trigger = container.querySelector("[data-slot='combobox-trigger']");
    if (!(trigger instanceof HTMLElement)) {
      throw new Error("Select trigger not found");
    }

    fireEvent.focus(trigger);

    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
  });

  it("keeps clear hidden when hovering outside the right adornment", () => {
    const { container } = render(
      <Select clearable items={ITEMS} placeholder="Pick fruit" value="apple" />
    );

    const trigger = container.querySelector("[data-slot='combobox-trigger']");
    if (!(trigger instanceof HTMLElement)) {
      throw new Error("Select trigger not found");
    }

    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();

    hoverAdornment(container);
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
  });

  it("keeps the plain adornment from intercepting trigger clicks", () => {
    const { container } = render(<Select items={ITEMS} value="apple" />);

    const adornment = container.querySelector("[data-select-adornment]");
    expect(adornment?.classList.contains("pointer-events-none")).toBe(true);
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

  it("renders the label for an empty-string value", () => {
    render(
      <Select
        items={[{ label: "None", value: "" }]}
        placeholder="Pick fruit"
        value=""
      />
    );

    expect(screen.getByText("None")).toBeTruthy();
    expect(screen.queryByText("Pick fruit")).toBeNull();
  });

  it("forwards id and aria props to the focusable control in every mode", () => {
    const plain = render(
      <Select aria-invalid id="fruit" items={ITEMS} value="apple" />
    );
    const trigger = plain.container.querySelector(
      "[data-slot='combobox-trigger']"
    );
    expect(trigger?.id).toBe("fruit");
    expect(trigger?.getAttribute("aria-invalid")).toBe("true");
    plain.unmount();

    const searchable = render(
      <Select
        aria-describedby="fruit-hint"
        id="fruit-search"
        items={ITEMS}
        searchable
      />
    );
    const input = searchable.container.querySelector("input[id]");
    expect(input?.id).toBe("fruit-search");
    expect(input?.getAttribute("aria-describedby")).toContain("fruit-hint");
    searchable.unmount();

    const multiple = render(
      <Select id="fruit-multi" items={ITEMS} multiple value={[]} />
    );
    expect(
      multiple.container.querySelector("input#fruit-multi")
    ).not.toBeNull();
  });

  it("refetches the default list after closing with a residual query", async () => {
    const loadItems = vi.fn((query: string) =>
      Promise.resolve(
        ITEMS.filter((item) => item.label.toLowerCase().includes(query))
      )
    );

    render(
      <Select
        debounceMs={0}
        defaultOpen
        loadItems={loadItems}
        searchable
        serverSideFilter
      />
    );
    await waitFor(() => expect(loadItems).toHaveBeenCalledTimes(1));
    expect(loadItems).toHaveBeenLastCalledWith("", expect.anything());

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ban" } });
    await waitFor(() => expect(loadItems).toHaveBeenCalledTimes(2));
    expect(loadItems).toHaveBeenLastCalledWith("ban", expect.anything());

    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => expect(loadItems).toHaveBeenCalledTimes(3));
    expect(loadItems).toHaveBeenLastCalledWith("", expect.anything());
  });

  it("clears stale server-side results while a new query is loading", async () => {
    const resolvers: Array<(items: SelectItem[]) => void> = [];
    const loadItems = vi.fn(
      () =>
        new Promise<SelectItem[]>((resolve) => {
          resolvers.push(resolve);
        })
    );

    render(
      <Select
        debounceMs={0}
        defaultOpen
        loadItems={loadItems}
        placeholder="Search fruit"
        searchable
        serverSideFilter
      />
    );

    await waitFor(() => expect(loadItems).toHaveBeenCalledTimes(1));
    act(() => {
      resolvers[0]?.(ITEMS);
    });

    expect(await screen.findByText("Apple")).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "zz" },
    });

    await waitFor(() => expect(loadItems).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText("Apple")).toBeNull());
    expect(screen.getByText("Loading…")).toBeTruthy();
  });
});
