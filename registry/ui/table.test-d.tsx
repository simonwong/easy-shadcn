import { createRef } from "react";
import { Table, type TableProps } from "./table";

interface Row {
  id: string;
  name: string;
}

declare const acceptProps: (props: TableProps<Row>) => undefined;

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
