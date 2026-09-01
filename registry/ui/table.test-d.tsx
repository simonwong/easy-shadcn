import { createRef } from "react";
import { Table, type TableCheckboxProps, type TableProps } from "./table";

interface Row {
  id: string;
  name: string;
}

declare const acceptProps: (props: TableProps<Row>) => undefined;
declare const acceptCheckboxProps: (
  props: Partial<TableCheckboxProps>
) => undefined;

const requiredProps = {
  columns: [{ dataIndex: "name" as const, key: "name", title: "Name" }],
  dataSource: [{ id: "1", name: "Ada" }],
  rowKey: "id" as const,
};

acceptProps({
  ...requiredProps,
  "aria-label": "Members",
  onClick: (event) => event.preventDefault(),
  ref: createRef<HTMLTableElement>(),
  role: "grid",
  style: { width: "100%" },
});

// @ts-expect-error Table owns its generated descendants.
acceptProps({ ...requiredProps, children: <tbody /> });

acceptProps({
  ...requiredProps,
  // @ts-expect-error Raw HTML conflicts with generated descendants.
  dangerouslySetInnerHTML: { __html: "<tbody />" },
});

// @ts-expect-error Busy state is derived from loading.
acceptProps({ ...requiredProps, "aria-busy": false });

const _dataAttributes = <Table {...requiredProps} data-consumer="kept" />;

// @ts-expect-error The root slot marker is fixed by Table.
const _forgedSlot = <Table {...requiredProps} data-slot="consumer-table" />;

acceptCheckboxProps({
  "aria-label": "Select Ada",
  className: (state) => (state.checked ? "checked" : "unchecked"),
  disabled: true,
  form: "members",
  inputRef: createRef<HTMLInputElement>(),
  onClick: (event) => event.preventDefault(),
  readOnly: true,
  ref: createRef<HTMLElement>(),
  required: true,
  style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
  value: "1",
});

acceptCheckboxProps({
  // @ts-expect-error Table owns the visible checkbox element.
  render: <button type="button" />,
});
acceptCheckboxProps({
  // @ts-expect-error Table owns the primitive root mode.
  nativeButton: true,
});
acceptCheckboxProps({
  // @ts-expect-error Table's row checkbox cannot become a parent checkbox.
  parent: true,
});
acceptCheckboxProps({
  // @ts-expect-error Table owns the checkbox role.
  role: "switch",
});
acceptCheckboxProps({
  // @ts-expect-error Checked ARIA is derived from Table selection state.
  "aria-checked": "mixed",
});
acceptCheckboxProps({
  // @ts-expect-error Disabled ARIA is derived from the disabled prop.
  "aria-disabled": true,
});
acceptCheckboxProps({
  // @ts-expect-error Raw HTML conflicts with the generated indicator.
  dangerouslySetInnerHTML: { __html: "forged" },
});

const _forgedCheckboxSlot = (
  <Table
    {...requiredProps}
    // @ts-expect-error The checkbox slot marker is fixed by Table.
    getCheckboxProps={() => ({
      "data-slot": "consumer-checkbox",
    })}
    selectable
  />
);
