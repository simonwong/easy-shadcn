import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { defineColumns, Table, type TablePagination } from "./table";

interface Item {
  id: string;
  name: string;
  score: number;
}
const data: Item[] = Array.from({ length: 23 }, (_, index) => ({
  id: `id-${index}`,
  name: `Item ${index}`,
  score: 23 - index,
}));
const columns = defineColumns<Item>()([
  { key: "name", dataIndex: "name", title: "Name" },
  {
    key: "score",
    dataIndex: "score",
    title: "Score",
    sorter: (a, b) => a.score - b.score,
  },
]);
const bodyRows = () =>
  within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");
const page = (value: number) =>
  screen.getByRole("button", { name: String(value) });

describe("Table pagination", () => {
  it("preserves the page through sorting and all source-index callbacks", () => {
    const onValueChange = vi.fn();
    const onRowClick = vi.fn();
    const renderCell = vi.fn(
      (value: string, _: Item, index: number) => `${value}:${index}`
    );
    const getCheckboxProps = vi.fn((_: Item, index: number) => ({
      "aria-label": `Source ${index}`,
    }));
    const indexedColumns = defineColumns<Item>()([
      { key: "name", dataIndex: "name", title: "Name", render: renderCell },
      columns[1],
    ]);
    render(
      <Table
        columns={indexedColumns}
        dataSource={data}
        getCheckboxProps={getCheckboxProps}
        onRowClick={onRowClick}
        pagination={{ defaultValue: 2, pageSize: 3, onValueChange }}
        rowClassName={(_, index) => `source-${index}`}
        rowKey={(_, index) => index}
        selectable
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    expect(page(2).getAttribute("aria-current")).toBe("page");
    expect(bodyRows()[0].textContent).toBe("Item 19:194");
    expect(bodyRows()[0].classList.contains("source-19")).toBe(true);
    fireEvent.click(bodyRows()[0]);
    expect(onRowClick).toHaveBeenCalledWith(data[19], 19);
    expect(renderCell).toHaveBeenCalledWith("Item 19", data[19], 19);
    expect(getCheckboxProps).toHaveBeenCalledWith(data[19], 19);
    expect(screen.getByRole("checkbox", { name: "Source 19" })).toBeTruthy();
    expect(data[0].id).toBe("id-0");
    expect(onValueChange).not.toHaveBeenCalled();
  });
  it("keeps controlled page and sort refusals independent and clamps only their projection", () => {
    const onValueChange = vi.fn();
    const onSortChange = vi.fn();
    const props = {
      columns,
      rowKey: "id" as const,
      sort: null,
      onSortChange,
      pagination: { value: 3, defaultValue: 1, onValueChange },
    };
    const { rerender } = render(<Table {...props} dataSource={data} />);
    fireEvent.click(page(2));
    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    expect(bodyRows()[0].textContent).toBe("Item 203");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(2);
    expect(onSortChange).toHaveBeenCalledTimes(1);
    rerender(<Table {...props} dataSource={data.slice(0, 2)} />);
    expect(page(1).getAttribute("aria-current")).toBe("page");
    rerender(<Table {...props} dataSource={data} />);
    expect(page(3).getAttribute("aria-current")).toBe("page");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
  it("preserves local state across off and external modes without reseeding defaults", () => {
    const props = { columns, rowKey: "id" as const, dataSource: data };
    const { rerender } = render(
      <Table {...props} pagination={{ defaultValue: 2 }} />
    );
    rerender(<Table {...props} pagination={false} />);
    expect(bodyRows()).toHaveLength(23);
    expect(screen.queryByRole("navigation")).toBeNull();
    rerender(
      <Table
        {...props}
        pagination={{
          mode: "external",
          total: 100,
          value: 5,
          onValueChange: vi.fn(),
        }}
      />
    );
    expect(bodyRows()).toHaveLength(23);
    rerender(<Table {...props} pagination={{ defaultValue: 3 }} />);
    expect(page(2).getAttribute("aria-current")).toBe("page");
    rerender(<Table {...props} pagination={{ pageSize: 20 }} />);
    expect(bodyRows()).toHaveLength(3);
    rerender(<Table {...props} dataSource={[]} pagination />);
    expect(screen.getByText("No data")).toBeTruthy();
    rerender(<Table {...props} pagination />);
    expect(page(1).getAttribute("aria-current")).toBe("page");
  });
  it.each<TablePagination>([
    false,
    { mode: "external", value: 3, total: 50, onValueChange: vi.fn() },
  ])("does not seed local defaults after mounting with %j", (pagination) => {
    const props = { columns, rowKey: "id" as const, dataSource: data };
    const { rerender } = render(<Table {...props} pagination={pagination} />);
    rerender(<Table {...props} pagination={{ defaultValue: 3 }} />);
    expect(page(1).getAttribute("aria-current")).toBe("page");
  });
  it.each([
    { pageSize: Number.NaN, value: Number.POSITIVE_INFINITY, count: 10 },
    { pageSize: 0, value: -1, count: 1 },
    { pageSize: 3.9, value: 2.9, count: 3 },
    { pageSize: Number.MAX_VALUE, value: Number.MAX_VALUE, count: 23 },
  ])("normalizes row and control state consistently for %j", ({
    pageSize,
    value,
    count,
  }) => {
    render(
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize, value }}
        rowKey="id"
      />
    );
    expect(bodyRows()).toHaveLength(count);
    expect(
      screen.getByRole("navigation").querySelectorAll('[aria-current="page"]')
    ).toHaveLength(1);
  });
  it("disables loading controls, ignores hostile extras and hides only single-page navigation", () => {
    const onValueChange = vi.fn();
    const pagination = {
      pageSize: 10,
      "aria-label": "Inventory pages",
      className: ["pages"],
      onValueChange,
      children: "Injected",
      dangerouslySetInnerHTML: { __html: "Injected" },
      role: "alert",
      "data-slot": "injected",
      getPageHref: () => "/evil",
    };
    const props = {
      columns,
      rowKey: "id" as const,
      dataSource: data,
      pagination: pagination as unknown as TablePagination,
    };
    const { rerender } = render(<Table {...props} loading selectable />);
    expect(page(2).getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(page(2));
    fireEvent.keyDown(page(2), { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(page(2).hasAttribute("href")).toBe(false);
    expect(screen.queryByText("Injected")).toBeNull();
    expect(
      screen
        .getByRole("navigation", { name: "Inventory pages" })
        .classList.contains("pages")
    ).toBe(true);
    rerender(
      <Table
        {...props}
        dataSource={[]}
        pagination={
          {
            ...pagination,
            hideOnSinglePage: true,
          } as unknown as TablePagination
        }
      />
    );
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByText("No data")).toBeTruthy();
  });
  it("limits sorted-page bulk selection to eligible rows and preserves off-page keys", () => {
    const onSelectedRowKeysChange = vi.fn();
    render(
      <Table
        columns={columns}
        dataSource={data}
        defaultSelectedRowKeys={["id-0", "id-21", "missing"]}
        defaultSort={{ columnKey: "score", order: "ascend" }}
        getCheckboxProps={(_, index) => ({ disabled: index === 21 })}
        onSelectedRowKeysChange={onSelectedRowKeysChange}
        pagination={{ pageSize: 3 }}
        rowKey="id"
        selectable
      />
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectedRowKeysChange).toHaveBeenLastCalledWith(
      ["id-20", "id-22", "id-0", "id-21", "missing"],
      [data[0], data[20], data[21], data[22]]
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectedRowKeysChange).toHaveBeenLastCalledWith(
      ["id-0", "id-21", "missing"],
      [data[0], data[21]]
    );
  });
  it("emits external page intent without slicing or advancing controlled rows", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Table
        columns={columns}
        dataSource={data.slice(10, 13)}
        pagination={{ mode: "external", value: 2, total: 100, onValueChange }}
        rowKey="id"
      />
    );
    expect(bodyRows()).toHaveLength(3);
    expect(bodyRows()[0].textContent).toBe("Item 1013");
    fireEvent.click(page(3));
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(page(2).getAttribute("aria-current")).toBe("page");
    rerender(
      <Table
        columns={columns}
        dataSource={data.slice(10, 13)}
        pagination={{ mode: "external", value: 2, total: 0, onValueChange }}
        rowKey="id"
      />
    );
    expect(bodyRows()).toHaveLength(3);
    expect(page(1).getAttribute("aria-current")).toBe("page");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
  it("clamps local state silently and never restores a page discarded by shrinking data", () => {
    const onValueChange = vi.fn();
    const props = {
      columns,
      rowKey: "id" as const,
      pagination: { defaultValue: 3, pageSize: 10, onValueChange },
    };
    const { rerender } = render(<Table {...props} dataSource={data} />);
    expect(bodyRows()[0].textContent).toBe("Item 203");
    rerender(<Table {...props} dataSource={data.slice(0, 12)} />);
    expect(bodyRows()[0].textContent).toBe("Item 1013");
    rerender(<Table {...props} dataSource={data} />);
    expect(page(2).getAttribute("aria-current")).toBe("page");
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(page(3));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(3);
  });
  it("renders ten-row pages with keyboard navigation and keeps the native table ref", () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table
        aria-label="Items"
        caption="Inventory"
        columns={columns}
        dataSource={data}
        pagination
        ref={ref}
        rowKey="id"
      />
    );
    expect(bodyRows()).toHaveLength(10);
    expect(bodyRows()[0].textContent).toBe("Item 023");
    expect(ref.current).toBe(screen.getByRole("table", { name: "Items" }));
    expect(
      screen
        .getByRole("navigation", { name: "Table pagination" })
        .closest("table")
    ).toBeNull();
    fireEvent.keyDown(page(2), { key: "Enter" });
    expect(bodyRows()[0].textContent).toBe("Item 1013");
    fireEvent.keyDown(page(3), { key: " " });
    expect(bodyRows()).toHaveLength(3);
    expect(page(3).getAttribute("aria-current")).toBe("page");
  });
});
