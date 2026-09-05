import { createRef } from "react";
import {
  defineColumns,
  Table,
  type TableCheckboxProps,
  type TableProps,
  type TableSort,
} from "./table";

interface Row {
  id: string;
  name: string;
}

declare const acceptProps: (props: TableProps<Row>) => undefined;
declare const acceptSort: (sort: TableSort | null) => undefined;

const sortingColumns = defineColumns<Row>()([
  {
    dataIndex: "name",
    key: "name",
    title: "Name",
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (value) => value.toUpperCase(),
  },
  { key: "remote", title: "Remote", sorter: true, sortLabel: "Remote order" },
]);

const _sorting = (
  <Table
    columns={sortingColumns}
    defaultSort={{ columnKey: "name", order: "ascend" }}
    onSortChange={acceptSort}
    rowKey="id"
    sort={null}
  />
);
// @ts-expect-error Sorting is single-column, not an array.
acceptSort([{ columnKey: "name", order: "ascend" }]);
// @ts-expect-error Direction must be the declared vocabulary.
acceptSort({ columnKey: "name", order: "ascending" });
defineColumns<Row>()([
  // @ts-expect-error Comparator returns a number, not a formatted value.
  { key: "name", title: "Name", sorter: (a, b) => a.name + b.name },
]);
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

acceptProps({ ...requiredProps, pagination: true });
const hostilePagination = { pageSize: 10, getPageHref: () => "/page" };
// @ts-expect-error Owned fields remain forbidden through variable assignment.
acceptProps({ ...requiredProps, pagination: hostilePagination });
acceptProps({ ...requiredProps, pagination: { value: 2, defaultValue: 1 } });
acceptProps({
  ...requiredProps,
  pagination: {
    mode: "external",
    total: 100,
    value: 2,
    onValueChange: () => undefined,
  },
});
// @ts-expect-error External pagination requires a controlled value and callback.
acceptProps({ ...requiredProps, pagination: { mode: "external", total: 100 } });
acceptProps({
  ...requiredProps,
  pagination: {
    mode: "external",
    total: 100,
    value: 1,
    onValueChange: () => undefined,
    // @ts-expect-error External pagination cannot use an initial local value.
    defaultValue: 2,
  },
});
// @ts-expect-error Local totals derive from supplied data.
acceptProps({ ...requiredProps, pagination: { total: 100 } });
// @ts-expect-error Table owns pagination children.
acceptProps({ ...requiredProps, pagination: { children: "forged" } });
acceptProps({
  ...requiredProps,
  // @ts-expect-error Table owns pagination raw HTML.
  pagination: { dangerouslySetInnerHTML: { __html: "forged" } },
});
// @ts-expect-error Table pagination is client state, not URL navigation.
acceptProps({ ...requiredProps, pagination: { getPageHref: () => "/page" } });
// @ts-expect-error Table owns the navigation landmark role.
acceptProps({ ...requiredProps, pagination: { role: "alert" } });
// @ts-expect-error Table owns the pagination marker.
acceptProps({ ...requiredProps, pagination: { "data-slot": "forged" } });

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
