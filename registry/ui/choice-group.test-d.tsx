import { createRef } from "react";
import {
  ChoiceGroup,
  type ChoiceGroupItem,
  type ChoiceGroupProps,
} from "./choice-group";

const items: ChoiceGroupItem[] = [{ label: "A", value: "a" }];
declare const acceptProps: (props: ChoiceGroupProps) => undefined;

export const choiceGroupTypeExamples = [
  <ChoiceGroup items={items} key="radio" />,
  <ChoiceGroup
    items={items}
    key="single-toggle"
    presentation="toggle"
    value="a"
  />,
  <ChoiceGroup
    items={items}
    key="checkbox"
    selectionMode="multiple"
    value={["a"]}
  />,
  <ChoiceGroup
    items={items}
    key="multiple-toggle"
    presentation="toggle"
    selectionMode="multiple"
    value={["a"]}
  />,
  // @ts-expect-error Radio presentation cannot express multiple selection.
  <ChoiceGroup
    items={items}
    key="invalid-radio"
    presentation="radio"
    selectionMode="multiple"
  />,
  // @ts-expect-error Checkbox presentation cannot express single selection.
  <ChoiceGroup
    items={items}
    key="invalid-checkbox"
    presentation="checkbox"
    selectionMode="single"
  />,
  // @ts-expect-error Multiple selection values are arrays.
  <ChoiceGroup
    items={items}
    key="invalid-value"
    selectionMode="multiple"
    value="a"
  />,
  // @ts-expect-error Radio presentation does not accept Toggle visual props.
  <ChoiceGroup items={items} key="invalid-variant" variant="outline" />,
];

const rootRef = createRef<HTMLDivElement>();

export const choiceGroupRootProps = (
  <ChoiceGroup
    aria-label="Channels"
    data-testid="choices"
    items={items}
    onClick={(event) => event.preventDefault()}
    ref={rootRef}
    style={{ color: "red" }}
  />
);

// @ts-expect-error ChoiceGroup owns its generated children.
acceptProps({ children: "Bypass", items });

// @ts-expect-error Raw HTML conflicts with generated children.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items });

// @ts-expect-error Root element replacement bypasses generated children.
acceptProps({ items, render: <section /> });

// @ts-expect-error ChoiceGroup owns its presentation-specific root role.
acceptProps({ items, role: "listbox" });

// @ts-expect-error Orientation ARIA is derived from orientation.
acceptProps({ "aria-orientation": "horizontal", items });

// @ts-expect-error Disabled ARIA is derived from disabled.
acceptProps({ "aria-disabled": true, items });

// @ts-expect-error Native change events conflict with onValueChange.
acceptProps({ items, onChange: () => undefined });
