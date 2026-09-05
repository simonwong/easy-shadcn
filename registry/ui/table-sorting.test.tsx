import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defineColumns, Table, type TableSort } from "./table";

interface RecordRow {
  id: string;
  name: string;
  score: number;
}

const rows: RecordRow[] = [
  { id: "a", name: "Ada", score: 20 },
  { id: "b", name: "Ben", score: 10 },
  { id: "c", name: "Cy", score: 20 },
];

const columns = defineColumns<RecordRow>()([
  { dataIndex: "name", key: "name", title: "Name" },
  {
    dataIndex: "score",
    key: "score",
    sorter: (a: RecordRow, b: RecordRow) => a.score - b.score,
    title: "Score",
  },
]);

const names = () =>
  within(screen.getAllByRole("rowgroup")[1])
    .getAllByRole("row")
    .map((row) => within(row).getAllByRole("cell")[0].textContent);

describe("Table sorting", () => {
  it("re-sorts replacement data and keeps selected readonly rows and off-page keys", () => {
    const onSelect = vi.fn();
    const onSortChange = vi.fn();
    const props = {
      columns,
      defaultSort: { columnKey: "score", order: "ascend" } as const,
      rowKey: "id" as const,
      onSelectedRowKeysChange: onSelect,
      onSortChange,
      selectable: true,
      defaultSelectedRowKeys: ["a", "c", "off-page"],
      getCheckboxProps: (record: RecordRow) => ({
        disabled: record.id === "a",
        readOnly: record.id === "c",
      }),
    };
    const { rerender } = render(<Table {...props} dataSource={rows} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      ["b", "a", "c", "off-page"],
      rows
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      ["a", "c", "off-page"],
      [rows[0], rows[2]]
    );
    rerender(
      <Table {...props} dataSource={[{ ...rows[0], score: 1 }, rows[1]]} />
    );
    const bodyRows = within(screen.getAllByRole("rowgroup")[1]).getAllByRole(
      "row"
    );
    expect(bodyRows.map((row) => row.textContent)).toEqual(["Ada1", "Ben10"]);
    expect(onSortChange).not.toHaveBeenCalled();
    rerender(<Table {...props} dataSource={null} />);
    expect(screen.getByRole("status").textContent).toBe("No data");
  });

  it("owns sort button structure and keeps its name, native type, and direction", () => {
    const forged = vi.fn();
    const unsafeColumn = {
      ...columns[1],
      sortLabel: "Sort score",
      title: <span aria-hidden="true">#</span>,
      onClick: forged,
      "aria-sort": "other",
      children: "Forged",
      dangerouslySetInnerHTML: { __html: "Forged" },
      renderHeader: forged,
    };
    render(
      <Table
        columns={[columns[0], unsafeColumn]}
        dataSource={rows}
        rowKey="id"
      />
    );
    const button = screen.getByRole("button", { name: "Sort score" });
    expect(button.getAttribute("type")).toBe("button");
    expect(screen.queryByText("Forged")).toBeNull();
    fireEvent.click(button);
    expect(names()).toEqual(["Ben", "Ada", "Cy"]);
    expect(button.closest("th")?.getAttribute("aria-sort")).toBe("ascending");
    expect(forged).not.toHaveBeenCalled();
  });

  it("does not mutate a frozen input array and treats undefined sort as uncontrolled", () => {
    const data = [...rows];
    Object.freeze(data);
    render(
      <Table
        columns={columns}
        dataSource={data}
        defaultSort={{ columnKey: "score", order: "descend" }}
        rowKey="id"
        sort={undefined}
      />
    );
    expect(names()).toEqual(["Ada", "Cy", "Ben"]);
    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
  });

  it.each([
    { columnKey: "missing", order: "ascend" },
    { columnKey: "name", order: "ascend" },
    { columnKey: "score", order: "invalid" },
  ])("ignores ineffective sort %j without callbacks", (sort) => {
    const onSortChange = vi.fn();
    render(
      <Table
        columns={columns}
        dataSource={rows}
        onSortChange={onSortChange}
        rowKey="id"
        sort={sort as TableSort}
      />
    );
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
    expect(
      screen
        .getAllByRole("columnheader")
        .every((header) => !header.hasAttribute("aria-sort"))
    ).toBe(true);
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it("temporarily suspends removed or ambiguous columns and restores stored intent", () => {
    const onSortChange = vi.fn();
    const props = {
      dataSource: rows,
      defaultSort: { columnKey: "score", order: "ascend" } as const,
      onSortChange,
      rowKey: "id" as const,
    };
    const { rerender } = render(<Table {...props} columns={columns} />);
    expect(names()).toEqual(["Ben", "Ada", "Cy"]);
    rerender(<Table {...props} columns={[columns[0]]} />);
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
    const warn = vi.spyOn(console, "error").mockImplementation(() => undefined);
    rerender(
      <Table
        {...props}
        columns={[...columns, { ...columns[1], title: "Duplicate score" }]}
      />
    );
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
    expect(
      screen
        .getAllByRole("columnheader")
        .every((header) => !header.hasAttribute("aria-sort"))
    ).toBe(true);
    rerender(<Table {...props} columns={columns} />);
    expect(names()).toEqual(["Ben", "Ada", "Cy"]);
    expect(onSortChange).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("keeps source indexes and source-order selected records while sorting the display", () => {
    const onSelect = vi.fn();
    const onRowClick = vi.fn();
    const getCheckboxProps = vi.fn((_record: RecordRow, index: number) => ({
      "aria-label": `Source ${index}`,
    }));
    const renderName = vi.fn(
      (name: string, _record: RecordRow, index: number) => `${name}:${index}`
    );
    render(
      <Table
        columns={[{ ...columns[0], render: renderName }, columns[1]]}
        dataSource={rows}
        defaultSelectedRowKeys={["off-page"]}
        defaultSort={{ columnKey: "score", order: "ascend" }}
        getCheckboxProps={getCheckboxProps}
        onRowClick={onRowClick}
        onSelectedRowKeysChange={onSelect}
        rowClassName={(_record, index) => `source-${index}`}
        rowKey={(_record, index) => `key-${index}`}
        selectable
      />
    );
    const first = within(screen.getAllByRole("rowgroup")[1]).getAllByRole(
      "row"
    )[0];
    expect(first.textContent).toBe("Ben:110");
    expect(first.className).toContain("source-1");
    fireEvent.click(screen.getByText("Ben:1"));
    expect(onRowClick).toHaveBeenCalledWith(rows[1], 1);
    fireEvent.click(screen.getByRole("checkbox", { name: "Source 1" }));
    expect(onSelect).toHaveBeenLastCalledWith(["off-page", "key-1"], [rows[1]]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      ["key-0", "key-1", "key-2", "off-page"],
      rows
    );
    expect(getCheckboxProps).toHaveBeenCalledWith(rows[1], 1);
  });

  it("switches columns to ascending and disables sorting while loading", () => {
    const sortable = [
      {
        ...columns[0],
        sorter: (a: RecordRow, b: RecordRow) => a.name.localeCompare(b.name),
      },
      columns[1],
    ];
    const onSortChange = vi.fn();
    const props = {
      columns: sortable,
      dataSource: rows,
      onSortChange,
      rowKey: "id" as const,
    };
    const { rerender } = render(<Table {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(onSortChange).toHaveBeenLastCalledWith({
      columnKey: "name",
      order: "ascend",
    });
    expect(
      screen
        .getByRole("columnheader", { name: "Score" })
        .hasAttribute("aria-sort")
    ).toBe(false);
    rerender(<Table {...props} loading />);
    expect(
      screen.getByRole("button", { name: "Score" }).hasAttribute("disabled")
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    expect(onSortChange).toHaveBeenCalledTimes(2);
  });

  it("keeps controlled sort authoritative until its parent accepts the request", () => {
    const onSortChange = vi.fn();
    const props = {
      columns,
      dataSource: rows,
      onSortChange,
      rowKey: "id" as const,
    };
    const { rerender } = render(
      <Table
        {...props}
        defaultSort={{ columnKey: "score", order: "descend" }}
        sort={null}
      />
    );
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
    expect(onSortChange).toHaveBeenCalledWith({
      columnKey: "score",
      order: "ascend",
    });
    rerender(
      <Table {...props} sort={{ columnKey: "score", order: "ascend" }} />
    );
    expect(names()).toEqual(["Ben", "Ada", "Cy"]);
    expect(onSortChange).toHaveBeenCalledTimes(1);
  });

  it("seeds an uncontrolled default once and emits external intent without sorting rows", () => {
    const externalColumns = columns.map((column) =>
      column.key === "score" ? { ...column, sorter: true as const } : column
    );
    const onSortChange = vi.fn();
    const props = {
      columns: externalColumns,
      dataSource: rows,
      onSortChange,
      rowKey: "id" as const,
    };
    const { rerender } = render(
      <Table {...props} defaultSort={{ columnKey: "score", order: "ascend" }} />
    );
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
    expect(
      screen
        .getByRole("columnheader", { name: "Score" })
        .getAttribute("aria-sort")
    ).toBe("ascending");
    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    expect(onSortChange).toHaveBeenCalledWith({
      columnKey: "score",
      order: "descend",
    });
    rerender(<Table {...props} defaultSort={null} />);
    expect(
      screen
        .getByRole("columnheader", { name: "Score" })
        .getAttribute("aria-sort")
    ).toBe("descending");
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
  });

  it("cycles stable ascending, descending, and source order without mutating data", () => {
    const onSortChange = vi.fn();
    render(
      <Table
        columns={columns}
        dataSource={rows}
        onSortChange={onSortChange}
        rowKey="id"
      />
    );
    const button = screen.getByRole("button", { name: "Score" });
    fireEvent.click(button);
    expect(names()).toEqual(["Ben", "Ada", "Cy"]);
    expect(
      screen
        .getByRole("columnheader", { name: "Score" })
        .getAttribute("aria-sort")
    ).toBe("ascending");
    fireEvent.click(button);
    expect(names()).toEqual(["Ada", "Cy", "Ben"]);
    fireEvent.click(button);
    expect(names()).toEqual(["Ada", "Ben", "Cy"]);
    expect(rows.map((row) => row.id)).toEqual(["a", "b", "c"]);
    expect(onSortChange.mock.calls).toEqual([
      [{ columnKey: "score", order: "ascend" }],
      [{ columnKey: "score", order: "descend" }],
      [null],
    ]);
  });
});
