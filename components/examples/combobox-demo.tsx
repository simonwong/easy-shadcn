"use client";

import { useState } from "react";
import { Combobox, type ComboboxItem } from "@/registry/ui/combobox";

const FRUITS: ComboboxItem[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Cherry", value: "cherry" },
  { label: "Grapes", value: "grapes" },
  { label: "Mango (out of stock)", value: "mango", disabled: true },
  { label: "Pineapple", value: "pineapple" },
];

const Demo = () => {
  const [value, setValue] = useState<string | undefined>("banana");
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <div className="flex max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Uncontrolled — type to filter, click to select.
        </span>
        <Combobox items={FRUITS} placeholder="Pick a fruit" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Controlled + clearable — selected: {value ?? "none"}
        </span>
        <Combobox
          clearable
          items={FRUITS}
          onValueChange={setValue}
          value={value}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Custom filter — matches the start of the label only.
        </span>
        <Combobox
          filter={(item, query) =>
            String(item.label).toLowerCase().startsWith(query.toLowerCase())
          }
          items={FRUITS}
          placeholder="Prefix search"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">Disabled.</span>
        <Combobox disabled items={FRUITS} placeholder="Unavailable" />
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          setSubmitted(String(data.get("fruit") || "(empty)"));
        }}
      >
        <label className="text-muted-foreground text-sm" htmlFor="fruit-field">
          Form integration — submits via a hidden input.
        </label>
        <Combobox
          defaultValue="cherry"
          id="fruit-field"
          items={FRUITS}
          name="fruit"
        />
        <button
          className="w-fit rounded-md border px-3 py-1 text-sm"
          type="submit"
        >
          Submit
        </button>
        {submitted !== null && (
          <span className="text-muted-foreground text-sm">
            Submitted: {submitted}
          </span>
        )}
      </form>
    </div>
  );
};

export default Demo;
