import {
  defineColumns,
  type TableColumnFilter,
  type TableFilters,
  type TableProps,
} from "./table";

interface Row {
  id: string;
  role: string;
}
declare const accept: (filter: TableColumnFilter<Row>) => void;
declare const acceptProps: (props: TableProps<Row>) => void;
accept({
  items: [{ value: "admin", label: "Admin" }],
  onFilter: (value, row) => row.role === value,
});
accept({ mode: "external", items: [], multiple: false });
const columns = defineColumns<Row>()([
  {
    key: "role",
    title: "Role",
    dataIndex: "role",
    filter: { items: [], onFilter: (value, row) => row.role === value },
  },
]);
acceptProps({
  columns,
  rowKey: "id",
  filters: {},
  onFiltersChange: (filters, details) => {
    const _filters: TableFilters = filters;
    const _page: 1 | undefined = details.pagination?.value;
    const _column: string = details.columnKey;
  },
});
// @ts-expect-error Local mode requires an explicit matcher.
accept({ items: [] });
// @ts-expect-error External filtering cannot also run a local predicate.
accept({ mode: "external", items: [], onFilter: () => true });
// @ts-expect-error Filter values are stable strings.
accept({ mode: "external", items: [{ value: 1, label: "One" }] });
// @ts-expect-error Finite option lists cannot replace panel structure.
accept({ mode: "external", items: [], render: () => null });
// @ts-expect-error Prop bags bypass filter ownership.
accept({ mode: "external", items: [], triggerProps: {} });
// @ts-expect-error Every column's state is a list even in single mode.
acceptProps({ columns, rowKey: "id", filters: { role: "admin" } });
