import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxItem } from "./combobox";

const ITEMS: ComboboxItem[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

const input = () => screen.getByRole("combobox") as HTMLInputElement;
const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`);
const items = () =>
  Array.from(document.querySelectorAll('[data-slot="combobox-item"]'));
const type = (value: string) =>
  fireEvent.change(input(), { target: { value } });

function hoverAdornment() {
  const adornment = document.querySelector("[data-select-adornment]");
  if (!adornment) {
    throw new Error("Combobox adornment not found");
  }
  fireEvent.mouseEnter(adornment);
}

describe("Combobox — Slice 1: skeleton, search, selection, styling", () => {
  it("renders an input plus a popover with items and no trigger button", () => {
    render(<Combobox defaultOpen items={ITEMS} />);

    expect(input()).toBeTruthy();
    expect(slot("combobox-content")).not.toBeNull();
    expect(items()).toHaveLength(3);
    expect(slot("combobox-trigger")).toBeNull();
    expect(document.querySelector("button")).toBeNull();
  });

  it("applies className to the InputGroup wrapper, not the input", () => {
    render(
      <Combobox className="wrapper-x" inputClassName="input-x" items={ITEMS} />
    );

    const wrapper = slot("input-group");
    expect(wrapper?.className).toContain("wrapper-x");
    expect(wrapper?.className).not.toContain("input-x");
    expect(input().className).toContain("input-x");
    expect(input().className).not.toContain("wrapper-x");
  });

  it("applies contentClassName to the popover container", () => {
    render(<Combobox contentClassName="content-x" defaultOpen items={ITEMS} />);

    expect(slot("combobox-content")?.className).toContain("content-x");
  });

  it("applies itemClassName to every item and merges per-item className after it", () => {
    render(
      <Combobox
        defaultOpen
        itemClassName="item-root"
        items={[{ ...ITEMS[0], itemClassName: "item-one" }, ITEMS[1], ITEMS[2]]}
      />
    );

    for (const el of items()) {
      expect(el.className).toContain("item-root");
    }
    const apple = items().find((el) => el.textContent === "Apple");
    expect(apple?.className).toContain("item-one");
  });

  it("applies emptyClassName to the empty state", () => {
    render(<Combobox defaultOpen emptyClassName="empty-x" items={[]} />);

    expect(slot("combobox-empty")?.className).toContain("empty-x");
  });

  it("filters by label with a case-insensitive substring match", () => {
    render(<Combobox defaultOpen items={ITEMS} />);

    type("AN");
    const labels = items().map((el) => el.textContent);
    expect(labels).toEqual(["Banana"]);
  });

  it("selects an item on click, fills the input, and closes the popover", () => {
    render(<Combobox defaultOpen items={ITEMS} />);

    fireEvent.click(screen.getByText("Cherry"));

    expect(input().value).toBe("Cherry");
    expect(slot("combobox-content")).toBeNull();
  });

  it("shows the default empty message when nothing matches", () => {
    render(<Combobox defaultOpen items={ITEMS} />);

    type("zzz");
    expect(items()).toHaveLength(0);
    expect(slot("combobox-empty")?.textContent).toContain("No results");
  });

  it("shows the default empty message for an empty items array", () => {
    render(<Combobox defaultOpen items={[]} />);

    expect(slot("combobox-empty")?.textContent).toContain("No results");
  });
});

describe("Combobox — Slice 2: open state + core ARIA", () => {
  it("renders the popover when controlled open is true and hides it when false", () => {
    const { rerender } = render(<Combobox items={ITEMS} open={false} />);
    expect(slot("combobox-content")).toBeNull();

    rerender(<Combobox items={ITEMS} open />);
    expect(slot("combobox-content")).not.toBeNull();
  });

  it("honors defaultOpen for the initial open state", () => {
    render(<Combobox defaultOpen items={ITEMS} />);
    expect(slot("combobox-content")).not.toBeNull();
  });

  it("defaults to closed", () => {
    render(<Combobox items={ITEMS} />);
    expect(slot("combobox-content")).toBeNull();
  });

  it("fires onOpenChange when the popover closes via Escape", () => {
    const onOpenChange = vi.fn();
    render(<Combobox defaultOpen items={ITEMS} onOpenChange={onOpenChange} />);

    fireEvent.keyDown(input(), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("exposes role=combobox and aria-expanded synced to the open state", () => {
    const { rerender } = render(<Combobox items={ITEMS} open={false} />);
    expect(input().getAttribute("role")).toBe("combobox");
    expect(input().getAttribute("aria-expanded")).toBe("false");

    rerender(<Combobox items={ITEMS} open />);
    expect(input().getAttribute("aria-expanded")).toBe("true");
  });

  it("links the input to the popover via aria-controls when open", () => {
    render(<Combobox defaultOpen items={ITEMS} />);

    const controls = input().getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls as string)).not.toBeNull();
  });
});

describe("Combobox — Slice 3: controlled value + placeholder", () => {
  it("controlled: fires onValueChange but does not change display until value updates", () => {
    const onValueChange = vi.fn();
    render(
      <Combobox
        defaultOpen
        items={ITEMS}
        onValueChange={onValueChange}
        value={undefined}
      />
    );

    fireEvent.click(screen.getByText("Banana"));
    expect(onValueChange).toHaveBeenCalledWith("banana");
    // Controlled with value={undefined}: display stays empty (placeholder mode).
    expect(input().value).toBe("");
  });

  it("controlled: reflects the value prop as the input display", () => {
    render(<Combobox items={ITEMS} value="banana" />);
    expect(input().value).toBe("Banana");
  });

  it("uncontrolled: defaultValue seeds the display and selection updates it", () => {
    render(<Combobox defaultValue="apple" items={ITEMS} />);
    expect(input().value).toBe("Apple");
  });

  it("uncontrolled: selecting updates the display immediately", () => {
    render(<Combobox defaultOpen items={ITEMS} />);

    fireEvent.click(screen.getByText("Banana"));
    expect(input().value).toBe("Banana");
  });

  it("shows the default placeholder when value is undefined", () => {
    render(<Combobox items={ITEMS} value={undefined} />);
    expect(input().getAttribute("placeholder")).toBe("Pick an option");
  });

  it("shows a custom placeholder", () => {
    render(<Combobox items={ITEMS} placeholder="Pick a fruit" />);
    expect(input().getAttribute("placeholder")).toBe("Pick a fruit");
  });
});

describe("Combobox — Slice 4: empty string vs undefined", () => {
  const withEmpty: ComboboxItem[] = [{ label: "None", value: "" }, ...ITEMS];

  it("treats value='' as a valid selection showing its label", () => {
    render(<Combobox items={withEmpty} value="" />);
    expect(input().value).toBe("None");
  });

  it("distinguishes undefined (placeholder) from '' (selected label)", () => {
    const { rerender } = render(
      <Combobox items={withEmpty} placeholder="Pick" value={undefined} />
    );
    expect(input().value).toBe("");
    expect(input().getAttribute("placeholder")).toBe("Pick");

    rerender(<Combobox items={withEmpty} placeholder="Pick" value="" />);
    expect(input().value).toBe("None");
  });

  it("selects the empty-string item on click", () => {
    const onValueChange = vi.fn();
    render(
      <Combobox defaultOpen items={withEmpty} onValueChange={onValueChange} />
    );

    fireEvent.click(screen.getByText("None"));
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(input().value).toBe("None");
  });

  it("shows a custom emptyMessage when nothing matches", () => {
    render(<Combobox defaultOpen emptyMessage="Nothing here" items={ITEMS} />);

    type("zzz");
    expect(slot("combobox-empty")?.textContent).toContain("Nothing here");
  });
});

describe("Combobox — Slice 5: disabled states", () => {
  it("does not select a disabled item", () => {
    const onValueChange = vi.fn();
    render(
      <Combobox
        defaultOpen
        items={[ITEMS[0], { ...ITEMS[1], disabled: true }, ITEMS[2]]}
        onValueChange={onValueChange}
      />
    );

    const banana = items().find((el) => el.textContent === "Banana");
    expect(banana?.matches('[data-disabled], [aria-disabled="true"]')).toBe(
      true
    );
    fireEvent.click(banana as Element);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables the input when root disabled is set", () => {
    render(<Combobox disabled items={ITEMS} />);
    expect(input().hasAttribute("disabled")).toBe(true);
  });

  it("does not open the popover when root disabled", () => {
    render(<Combobox disabled items={ITEMS} />);

    fireEvent.focus(input());
    fireEvent.click(input());
    expect(slot("combobox-content")).toBeNull();
  });
});

describe("Combobox — Slice 6: clearable", () => {
  it("renders no clear button by default", () => {
    render(<Combobox items={ITEMS} value="apple" />);
    hoverAdornment();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("shows the clear button on hover when a value exists", () => {
    render(<Combobox clearable items={ITEMS} value="apple" />);
    hoverAdornment();
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
  });

  it("hides the clear button when there is no value", () => {
    render(<Combobox clearable items={ITEMS} value={undefined} />);
    hoverAdornment();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("clears to undefined and empties the input on clear click", () => {
    const onValueChange = vi.fn();

    function Controlled() {
      const [value, setValue] = useState<string | undefined>("apple");
      return (
        <Combobox
          clearable
          items={ITEMS}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
          value={value}
        />
      );
    }

    render(<Controlled />);
    expect(input().value).toBe("Apple");

    hoverAdornment();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(input().value).toBe("");
  });

  it("disables the clear affordance when root disabled", () => {
    render(<Combobox clearable disabled items={ITEMS} value="apple" />);
    hoverAdornment();
    const clear = screen.queryByRole("button", { name: "Clear" });
    if (clear) {
      expect(clear.hasAttribute("disabled")).toBe(true);
    } else {
      expect(clear).toBeNull();
    }
  });
});

describe("Combobox — Slice 7: custom filter", () => {
  it("uses the custom filter instead of the default match", () => {
    const filter = vi.fn(
      (item: ComboboxItem, query: string) =>
        query === "" || item.value.startsWith(query)
    );
    render(<Combobox defaultOpen filter={filter} items={ITEMS} />);

    // Default label match would drop "Banana" for query "c"; value-prefix keeps
    // only "cherry".
    type("c");
    expect(items().map((el) => el.textContent)).toEqual(["Cherry"]);
    expect(filter).toHaveBeenCalled();
  });

  it("shows all items for an empty query and empty state for no matches", () => {
    const filter = (item: ComboboxItem, query: string) =>
      query === "" || item.value.startsWith(query);
    render(<Combobox defaultOpen filter={filter} items={ITEMS} />);

    expect(items()).toHaveLength(3);
    type("zzz");
    expect(items()).toHaveLength(0);
    expect(slot("combobox-empty")).not.toBeNull();
  });
});

describe("Combobox — Slice 8: form integration + ARIA", () => {
  it("emits a hidden input carrying the selected value", () => {
    const { container } = render(
      <Combobox items={ITEMS} name="fruit" value="banana" />
    );

    const hidden = container.querySelector(
      'input[name="fruit"][aria-hidden="true"]'
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden?.value).toBe("banana");
  });

  it("carries an empty hidden value when nothing is selected", () => {
    const { container } = render(
      <Combobox items={ITEMS} name="fruit" value={undefined} />
    );

    const hidden = container.querySelector(
      'input[name="fruit"][aria-hidden="true"]'
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden?.value).toBe("");
  });

  it("applies id and aria attributes to the input", () => {
    render(
      <Combobox
        aria-describedby="hint"
        aria-invalid
        id="fruit-input"
        items={ITEMS}
      />
    );

    expect(input().id).toBe("fruit-input");
    expect(input().getAttribute("aria-invalid")).toBe("true");
    expect(input().getAttribute("aria-describedby")).toContain("hint");
  });

  it("submits the selected value through the hidden input", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <form onSubmit={onSubmit}>
        <Combobox items={ITEMS} name="fruit" value="cherry" />
        <button type="submit">Go</button>
      </form>
    );

    const form = container.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalled();
    const data = new FormData(form);
    expect(data.get("fruit")).toBe("cherry");
  });

  it("keeps id/aria on the input while the popover is open", () => {
    render(<Combobox aria-invalid defaultOpen id="x" items={ITEMS} />);

    const popup = slot("combobox-content") as HTMLElement;
    expect(within(popup).queryByRole("combobox")).toBeNull();
    expect(input().id).toBe("x");
  });
});
