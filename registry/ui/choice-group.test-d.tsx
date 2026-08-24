import { ChoiceGroup, type ChoiceGroupItem } from "./choice-group";

const items: ChoiceGroupItem[] = [{ label: "A", value: "a" }];

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
