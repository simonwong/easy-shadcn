import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  defineColumns,
  Table,
  type TableFilters,
  type TableProps,
} from "./table";

interface Item {
  id: string;
  name: string;
  role: string;
  score: number;
  team: string;
}
const data: Item[] = [
  { id: "a", name: "Ada", role: "admin", team: "east", score: 4 },
  { id: "b", name: "Ben", role: "member", team: "west", score: 2 },
  { id: "c", name: "Cat", role: "admin", team: "west", score: 1 },
  { id: "d", name: "Dan", role: "guest", team: "east", score: 3 },
  { id: "e", name: "Eve", role: "member", team: "east", score: 5 },
];
const rolePattern = /Role/;
const roleItems = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "guest", label: "Guest" },
];
const columns = defineColumns<Item>()([
  { key: "name", dataIndex: "name", title: "Name" },
  {
    key: "role",
    dataIndex: "role",
    title: "Role",
    sorter: (a, b) => a.score - b.score,
    filter: {
      items: roleItems,
      onFilter: (value, record) => record.role === value,
    },
  },
  {
    key: "team",
    dataIndex: "team",
    title: "Team",
    filter: {
      items: [
        { value: "east", label: "East" },
        { value: "west", label: "West" },
      ],
      onFilter: (value, record) => record.team === value,
    },
  },
]);
const names = () =>
  within(screen.getAllByRole("rowgroup")[1])
    .getAllByRole("row")
    .map((row) => within(row).getAllByRole("cell")[0].textContent);
function setup(props: Partial<TableProps<Item>> = {}) {
  return render(
    <Table
      aria-label="People"
      columns={columns}
      dataSource={data}
      rowKey="id"
      {...props}
    />
  );
}
async function open(label = "Filter Role") {
  fireEvent.click(
    screen.getByRole("button", { name: new RegExp(`^${label}`) })
  );
  return await screen.findByRole("dialog", { name: label });
}
async function apply() {
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}
async function choose(option: string, label = "Filter Role") {
  const panel = await open(label);
  fireEvent.click(within(panel).getByRole("checkbox", { name: option }));
  await apply();
}

describe("Table filtering", () => {
  it("keeps drafts until Apply and combines same-column OR with cross-column AND", async () => {
    const onFiltersChange = vi.fn();
    setup({ onFiltersChange });
    const panel = await open();
    fireEvent.click(within(panel).getByRole("checkbox", { name: "Admin" }));
    fireEvent.click(within(panel).getByRole("checkbox", { name: "Member" }));
    expect(names()).toEqual(data.map((item) => item.name));
    expect(onFiltersChange).not.toHaveBeenCalled();
    await apply();
    expect(names()).toEqual(["Ada", "Ben", "Cat", "Eve"]);
    expect(onFiltersChange).toHaveBeenLastCalledWith(
      { role: ["admin", "member"] },
      { columnKey: "role", pagination: null }
    );
    await choose("East", "Filter Team");
    expect(names()).toEqual(["Ada", "Eve"]);
    expect(
      screen.getByRole("button", { name: "Filter Role (2 active)" })
    ).toBeTruthy();
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(names()).toEqual(["Ada", "Dan", "Eve"]);
    expect(onFiltersChange).toHaveBeenLastCalledWith(
      { team: ["east"] },
      { columnKey: "role", pagination: null }
    );
  });
  it("discards Escape drafts, restores focus, and does not emit unchanged commits", async () => {
    const onFiltersChange = vi.fn();
    setup({ onFiltersChange });
    const panel = await open();
    const checkbox = within(panel).getByRole("checkbox", { name: "Admin" });
    fireEvent.click(checkbox);
    act(() => checkbox.focus());
    fireEvent.keyDown(checkbox, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Filter Role" })
      )
    );
    await open();
    expect(
      screen
        .getByRole("checkbox", { name: "Admin" })
        .getAttribute("aria-checked")
    ).toBe("false");
    await apply();
    expect(onFiltersChange).not.toHaveBeenCalled();
  });
  it("resets local pages after accepted filters, preserving sort and full-source indices", async () => {
    const onValueChange = vi.fn();
    const onRowClick = vi.fn();
    const onFiltersChange = vi.fn();
    const renderCell = vi.fn(
      (value: string, _: Item, index: number) => `${value}:${index}`
    );
    const indexed = defineColumns<Item>()([
      { ...columns[0], render: renderCell },
      columns[1],
      columns[2],
    ]);
    setup({
      columns: indexed,
      pagination: { pageSize: 1, defaultValue: 3, onValueChange },
      sort: { columnKey: "role", order: "ascend" },
      rowKey: (_, index) => index,
      rowClassName: (_, index) => `source-${index}`,
      onRowClick,
      onFiltersChange,
    });
    await choose("Admin");
    expect(names()).toEqual(["Cat:2"]);
    expect(
      screen.getByRole("button", { name: "1" }).getAttribute("aria-current")
    ).toBe("page");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(
      { role: ["admin"] },
      { columnKey: "role", pagination: { value: 1 } }
    );
    expect(renderCell).toHaveBeenCalledWith("Cat", data[2], 2);
    fireEvent.click(screen.getByText("Cat:2"));
    expect(onRowClick).toHaveBeenCalledWith(data[2], 2);
    expect(screen.getByText("Cat:2").closest("tr")?.className).toContain(
      "source-2"
    );
    expect(data.map((item) => item.id)).toEqual(["a", "b", "c", "d", "e"]);
  });
  it("does not reset the page on refused filters and reloads accepted values on reopen", async () => {
    const onFiltersChange = vi.fn();
    const props = {
      filters: {},
      onFiltersChange,
      pagination: { pageSize: 1, defaultValue: 3 },
    };
    const view = setup(props);
    await choose("Admin");
    expect(names()).toEqual(["Cat"]);
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");
    await open();
    expect(
      screen
        .getByRole("checkbox", { name: "Admin" })
        .getAttribute("aria-checked")
    ).toBe("false");
    await apply();
    view.rerender(
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        {...props}
        filters={{ role: ["admin"] }}
      />
    );
    expect(names()).toEqual(["Ada"]);
    expect(onFiltersChange).toHaveBeenCalledTimes(1);
  });
  it("keeps controlled pagination caller-owned and emits one external query intent", async () => {
    const onFiltersChange = vi.fn();
    const onValueChange = vi.fn();
    setup({
      columns: [
        columns[0],
        { ...columns[1], filter: { mode: "external", items: roleItems } },
      ],
      filters: {},
      onFiltersChange,
      pagination: {
        mode: "external",
        total: 100,
        value: 3,
        pageSize: 5,
        onValueChange,
      },
    });
    await choose("Admin");
    expect(names()).toEqual(data.map((item) => item.name));
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledOnce();
    expect(onFiltersChange).toHaveBeenCalledWith(
      { role: ["admin"] },
      { columnKey: "role", pagination: { value: 1 } }
    );
  });
  it("preserves hidden, off-page, disabled, readonly and absent selected keys", async () => {
    const onSelectedRowKeysChange = vi.fn();
    setup({
      selectable: true,
      defaultSelectedRowKeys: ["b", "c", "d", "missing"],
      onSelectedRowKeysChange,
      pagination: { pageSize: 1 },
      getCheckboxProps: (row, index) => ({
        disabled: row.id === "d",
        readOnly: row.id === "c",
        "aria-label": `Source ${index}`,
      }),
    });
    await choose("Admin");
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectedRowKeysChange).toHaveBeenLastCalledWith(
      ["a", "b", "c", "d", "missing"],
      [data[0], data[1], data[2], data[3]]
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectedRowKeysChange).toHaveBeenLastCalledWith(
      ["b", "c", "d", "missing"],
      [data[1], data[2], data[3]]
    );
    expect(screen.getByRole("checkbox", { name: "Source 0" })).toBeTruthy();
  });
  it("supports single selection, clears to no filter, and keeps sorting independent", async () => {
    setup({
      columns: [
        columns[0],
        { ...columns[1], filter: { ...columns[1].filter, multiple: false } },
      ],
    });
    await open();
    fireEvent.click(screen.getByRole("radio", { name: "Guest" }));
    await apply();
    expect(names()).toEqual(["Dan"]);
    expect(
      screen
        .getByRole("columnheader", { name: rolePattern })
        .hasAttribute("aria-sort")
    ).toBe(false);
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(names()).toEqual(data.map((item) => item.name));
  });
  it("renders the existing empty state for zero matches and disables bulk selection", () => {
    setup({
      filters: { role: ["guest"], team: ["west"] },
      selectable: true,
      pagination: true,
      emptyMessage: "No matches",
    });
    expect(screen.getByRole("status").textContent).toBe("No matches");
    expect(
      screen
        .getByRole("checkbox", { name: "Select all rows" })
        .getAttribute("aria-disabled")
    ).toBe("true");
    expect(screen.getByRole("button", { name: "1" })).toBeTruthy();
  });
  it("suspends missing and ambiguous filter definitions without callbacks, restoring intent later", () => {
    const onFiltersChange = vi.fn();
    const props = {
      defaultFilters: { role: ["admin", "unknown", "admin"] },
      onFiltersChange,
    };
    const view = setup(props);
    expect(names()).toEqual(["Ada", "Cat"]);
    view.rerender(
      <Table columns={[columns[0]]} dataSource={data} rowKey="id" {...props} />
    );
    expect(names()).toHaveLength(5);
    view.rerender(
      <Table columns={columns} dataSource={data} rowKey="id" {...props} />
    );
    expect(names()).toEqual(["Ada", "Cat"]);
    view.rerender(
      <Table
        columns={[
          columns[0],
          {
            ...columns[1],
            filter: {
              ...columns[1].filter,
              items: [roleItems[0], roleItems[0]],
            },
          },
        ]}
        dataSource={data}
        rowKey="id"
        {...props}
      />
    );
    expect(names()).toHaveLength(5);
    expect(onFiltersChange).not.toHaveBeenCalled();
  });
  it("updates an open draft when controlled values change and honors disabled options/loading", async () => {
    const onFiltersChange = vi.fn();
    const props = {
      columns: [
        columns[0],
        {
          ...columns[1],
          filter: {
            ...columns[1].filter,
            items: [roleItems[0], { ...roleItems[1], disabled: true }],
          },
        },
      ],
      filters: {},
      onFiltersChange,
    };
    const view = setup(props);
    await open();
    expect(
      screen
        .getByRole("checkbox", { name: "Member" })
        .getAttribute("aria-disabled")
    ).toBe("true");
    fireEvent.click(screen.getByRole("checkbox", { name: "Admin" }));
    view.rerender(
      <Table
        dataSource={data}
        rowKey="id"
        {...props}
        filters={{ role: ["member"] }}
        loading
      />
    );
    expect(
      screen
        .getByRole("checkbox", { name: "Admin" })
        .getAttribute("aria-checked")
    ).toBe("false");
    expect(
      screen
        .getByRole("checkbox", { name: "Member" })
        .getAttribute("aria-checked")
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onFiltersChange).not.toHaveBeenCalled();
  });
  it("supports special string identities and ignores inherited filter properties", async () => {
    const special = [{ ...columns[1], key: "__proto__" }];
    const onFiltersChange = vi.fn();
    setup({
      columns: special,
      onFiltersChange,
      filters: Object.create({ __proto__: ["admin"] }),
    });
    await choose("Admin");
    const next = onFiltersChange.mock.calls[0][0];
    expect(Object.hasOwn(next, "__proto__")).toBe(true);
    expect(next.__proto__).toEqual(["admin"]);
    expect(Object.getPrototypeOf(next)).toBe(Object.prototype);
  });
  it("accepts external filters and page one atomically without losing source identity", async () => {
    function Remote() {
      const [query, setQuery] = useState<{
        filters: TableFilters;
        page: number;
      }>({ filters: {}, page: 3 });
      return (
        <Table
          columns={[
            columns[0],
            { ...columns[1], filter: { mode: "external", items: roleItems } },
          ]}
          dataSource={data}
          filters={query.filters}
          onFiltersChange={(filters, details) =>
            setQuery({ filters, page: details.pagination?.value ?? query.page })
          }
          pagination={{
            mode: "external",
            value: query.page,
            total: 100,
            onValueChange: (page) => setQuery({ ...query, page }),
          }}
          rowKey="id"
        />
      );
    }
    render(<Remote />);
    await choose("Admin");
    expect(
      screen.getByRole("button", { name: "1" }).getAttribute("aria-current")
    ).toBe("page");
    expect(names()).toHaveLength(5);
    expect(
      screen.getByRole("button", { name: "Filter Role (1 active)" })
    ).toBeTruthy();
  });
});

describe("Table filter integration boundaries", () => {
  it.each([
    { from: "external", to: "local", initialName: "Ben" },
    { from: "local", to: "external", initialName: "Cat" },
  ] as const)("resets an uncontrolled local page when an active filter switches from $from to $to", ({
    from,
    to,
    initialName,
  }) => {
    const onValueChange = vi.fn();
    const onFiltersChange = vi.fn();
    const modeColumns = (mode: "local" | "external") => [
      columns[0],
      {
        ...columns[1],
        filter:
          mode === "external"
            ? { mode, items: roleItems }
            : { ...columns[1].filter, mode },
      },
    ];
    const props = {
      filters: { role: ["admin"] },
      pagination: { defaultValue: 2, pageSize: 1, onValueChange },
      onFiltersChange,
    };
    const view = setup({ ...props, columns: modeColumns(from) });
    expect(names()).toEqual([initialName]);
    view.rerender(
      <Table
        columns={modeColumns(to)}
        dataSource={data}
        rowKey="id"
        {...props}
      />
    );
    expect(names()).toEqual(["Ada"]);
    expect(
      screen.getByRole("button", { name: "1" }).getAttribute("aria-current")
    ).toBe("page");
    expect(onFiltersChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });
  it("preserves the page when implicit local mode becomes explicit", () => {
    const props = {
      filters: { role: ["admin"] },
      pagination: { defaultValue: 2, pageSize: 1 },
    };
    const view = setup(props);
    expect(names()).toEqual(["Cat"]);
    view.rerender(
      <Table
        columns={[
          columns[0],
          {
            ...columns[1],
            filter: { ...columns[1].filter, mode: "local" },
          },
          columns[2],
        ]}
        dataSource={data}
        rowKey="id"
        {...props}
      />
    );
    expect(names()).toEqual(["Cat"]);
    expect(
      screen.getByRole("button", { name: "2" }).getAttribute("aria-current")
    ).toBe("page");
  });
  it("does not submit forms or forward untyped panel and trigger overrides", async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onClick = vi.fn();
    const unsafeFilter = {
      ...columns[1].filter,
      render: <div>Injected</div>,
      children: "Injected",
      dangerouslySetInnerHTML: { __html: "Injected" },
      triggerProps: { onClick },
      items: [
        { value: "admin", label: "Admin", onClick, children: "Injected" },
      ],
    };
    render(
      <form onSubmit={onSubmit}>
        <Table
          columns={[columns[0], { ...columns[1], filter: unsafeFilter }]}
          dataSource={data}
          rowKey="id"
        />
      </form>
    );
    await choose("Admin");
    expect(names()).toEqual(["Ada", "Cat"]);
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByText("Injected")).toBeNull();
  });
  it("clamps a controlled local page without taking over its reset or emitting page changes", async () => {
    const onValueChange = vi.fn();
    const onFiltersChange = vi.fn();
    setup({
      pagination: { value: 3, pageSize: 1, onValueChange },
      onFiltersChange,
    });
    await choose("Admin");
    expect(names()).toEqual(["Cat"]);
    expect(
      screen.getByRole("button", { name: "2" }).getAttribute("aria-current")
    ).toBe("page");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(
      { role: ["admin"] },
      { columnKey: "role", pagination: { value: 1 } }
    );
  });
  it("keeps the page for equivalent filter values and data updates", () => {
    const onFiltersChange = vi.fn();
    const props = {
      filters: { role: ["admin", "member"] },
      defaultFilters: { role: ["guest"] },
      pagination: { defaultValue: 2, pageSize: 1 },
      onFiltersChange,
    };
    const view = setup(props);
    expect(names()).toEqual(["Ben"]);
    view.rerender(
      <Table
        columns={columns}
        dataSource={[...data]}
        rowKey="id"
        {...props}
        filters={{ role: ["member", "admin", "admin"] }}
      />
    );
    expect(names()).toEqual(["Ben"]);
    expect(onFiltersChange).not.toHaveBeenCalled();
  });
});
