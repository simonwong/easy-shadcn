import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest";
import {
  defineColumns,
  Table,
  type TableCheckboxProps,
  type TableColumn,
} from "./table";

interface User {
  age: number;
  id: string;
  name: string;
}

const USERS: User[] = [
  { age: 30, id: "u1", name: "Ada" },
  { age: 45, id: "u2", name: "Linus" },
  { age: 25, id: "u3", name: "Grace" },
];

const BASIC_COLUMNS: TableColumn<User>[] = [
  { dataIndex: "name", key: "name", title: "Name" },
  { dataIndex: "age", key: "age", title: "Age" },
];

const DUP_KEYS_RE = /Duplicate row keys/;
const DUP_COL_KEYS_RE = /Duplicate column keys/;
const NO_NAME_RE = /No accessible name/;
const BOTH_SELECTED_RE = /Both `selectedRowKeys`/;
const NULLISH_KEY_RE = /resolved to null or undefined/;
const SYMBOL_KEY_RE = /resolved to a Symbol/;
const INVALID_KEY_RE = /resolved to a non-string \/ non-number value/;
const CONTROLLED_SWITCH_RE = /switched from .* to /;

function getBodyRows() {
  // tbody is the last rowgroup (thead is the first). Using role="row" verifies
  // that onRowClick rows preserve their implicit table-row semantics — we no
  // longer override with role="button" (W3C ARIA APG grid pattern).
  const rowgroups = screen.getAllByRole("rowgroup");
  const tbody = rowgroups.at(-1) as HTMLElement;
  return within(tbody).queryAllByRole("row");
}

describe("Table", () => {
  it("renders one <th> per column and one <tr> per data row", () => {
    render(<Table columns={BASIC_COLUMNS} dataSource={USERS} rowKey="id" />);
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(getBodyRows()).toHaveLength(3);
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("45")).toBeTruthy();
  });

  it("derives row key from a string field (rows render in source order)", () => {
    const { container } = render(
      <Table columns={BASIC_COLUMNS} dataSource={USERS} rowKey="id" />
    );
    const firstName = container.querySelector(
      "tbody tr:first-child td"
    )?.textContent;
    expect(firstName).toBe("Ada");
  });

  it("derives row key from a function — emitted keys reflect the function output", () => {
    const onSelect = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        onSelectedRowKeysChange={onSelect}
        rowKey={(r) => `k-${r.id}`}
        selectable
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    // index 0 is header "select all"; index 1 is first body row.
    fireEvent.click(checkboxes[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toEqual(["k-u1"]);
    expect(onSelect.mock.calls[0][1]).toEqual([USERS[0]]);
  });

  it("calls column.render with (value, record, index) and renders the result", () => {
    const renderFn = vi.fn(
      (value, record: User, index) => `${index}:${record.name}=${String(value)}`
    );
    const columns: TableColumn<User>[] = [
      { dataIndex: "name", key: "name", render: renderFn, title: "Name" },
    ];
    render(<Table columns={columns} dataSource={USERS} rowKey="id" />);
    expect(renderFn).toHaveBeenCalledWith("Ada", USERS[0], 0);
    expect(screen.getByText("0:Ada=Ada")).toBeTruthy();
    expect(screen.getByText("2:Grace=Grace")).toBeTruthy();
  });

  it("shows loadingMessage and hides emptyMessage when loading", () => {
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={[]}
        emptyMessage="EMPTY"
        loading
        loadingMessage="LOADING"
        rowKey="id"
      />
    );
    expect(screen.getByText("LOADING")).toBeTruthy();
    expect(screen.queryByText("EMPTY")).toBeNull();
  });

  it("shows emptyMessage when dataSource is empty and not loading", () => {
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={[]}
        emptyMessage="Nothing here"
        rowKey="id"
      />
    );
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("applies function-form rowClassName to each <tr>", () => {
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowClassName={(r) => (r.age >= 40 ? "row-old" : "row-young")}
        rowKey="id"
      />
    );
    const rows = getBodyRows();
    expect(rows[0].className).toContain("row-young");
    expect(rows[1].className).toContain("row-old");
    expect(rows[2].className).toContain("row-young");
  });

  it("selection: clicking a row checkbox fires onSelectedRowKeysChange(keys, rows)", () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        onSelectedRowKeysChange={onChange}
        rowKey="id"
        selectable
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[2]); // second body row (u2)
    expect(onChange).toHaveBeenCalledWith(["u2"], [USERS[1]]);
  });

  it("selection: header checkbox is indeterminate when a proper non-empty subset is selected", () => {
    function Harness() {
      const [keys, setKeys] = useState<string[]>(["u1"]);
      return (
        <Table
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          onSelectedRowKeysChange={setKeys}
          rowKey="id"
          selectable
          selectedRowKeys={keys}
        />
      );
    }
    render(<Harness />);
    const checkboxes = screen.getAllByRole("checkbox");
    const header = checkboxes[0];
    // base-ui marks the indeterminate state via aria-checked="mixed".
    expect(header.getAttribute("aria-checked")).toBe("mixed");
  });

  it("selection: header toggles all selectable rows, skipping disabled rows", () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={(r) => ({ disabled: r.id === "u1" })}
        onSelectedRowKeysChange={onChange}
        rowKey="id"
        selectable
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]); // header "select all"
    expect(onChange).toHaveBeenCalledTimes(1);
    const [keys, rows] = onChange.mock.calls[0];
    expect(keys).toEqual(["u2", "u3"]);
    expect(rows).toEqual([USERS[1], USERS[2]]);
  });

  // ---------------------------------------------------------------------------
  // Selection — uncontrolled / controlled / cycle
  // ---------------------------------------------------------------------------

  it("selection (uncontrolled): defaultSelectedRowKeys seeds initial state and reflects in UI", () => {
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        defaultSelectedRowKeys={["u2"]}
        rowKey="id"
        selectable
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    // index 0 = header, 1=u1, 2=u2, 3=u3
    expect(checkboxes[2].getAttribute("aria-checked")).toBe("true");
    expect(checkboxes[1].getAttribute("aria-checked")).toBe("false");
    expect(checkboxes[3].getAttribute("aria-checked")).toBe("false");
    // Header should be indeterminate (mixed) — 1 of 3 selected.
    expect(checkboxes[0].getAttribute("aria-checked")).toBe("mixed");
  });

  it("selection (controlled): external selectedRowKeys updates drive the UI", () => {
    function Harness() {
      const [keys, setKeys] = useState<string[]>([]);
      return (
        <>
          <button onClick={() => setKeys(["u1", "u3"])} type="button">
            external set
          </button>
          <Table
            columns={BASIC_COLUMNS}
            dataSource={USERS}
            rowKey="id"
            selectable
            selectedRowKeys={keys}
          />
        </>
      );
    }
    render(<Harness />);
    // Initially nothing checked.
    let checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[1].getAttribute("aria-checked")).toBe("false");
    expect(checkboxes[3].getAttribute("aria-checked")).toBe("false");
    // Drive selection externally.
    fireEvent.click(screen.getByRole("button", { name: "external set" }));
    checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[1].getAttribute("aria-checked")).toBe("true");
    expect(checkboxes[2].getAttribute("aria-checked")).toBe("false");
    expect(checkboxes[3].getAttribute("aria-checked")).toBe("true");
  });

  it("selection: select-all → unselect-all cycle yields ([all], [])", () => {
    const onChange = vi.fn();
    function Harness() {
      const [keys, setKeys] = useState<string[]>([]);
      return (
        <Table
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          onSelectedRowKeysChange={(k, r) => {
            onChange(k, r);
            setKeys(k);
          }}
          rowKey="id"
          selectable
          selectedRowKeys={keys}
        />
      );
    }
    render(<Harness />);
    const header = () => screen.getAllByRole("checkbox")[0];
    fireEvent.click(header()); // select all
    expect(onChange).toHaveBeenLastCalledWith(["u1", "u2", "u3"], USERS);
    fireEvent.click(header()); // unselect all
    expect(onChange).toHaveBeenLastCalledWith([], []);
    // UI confirms.
    const cbs = screen.getAllByRole("checkbox");
    expect(cbs[1].getAttribute("aria-checked")).toBe("false");
    expect(cbs[2].getAttribute("aria-checked")).toBe("false");
    expect(cbs[3].getAttribute("aria-checked")).toBe("false");
  });

  it("selection: toggling one row's checkbox does not affect siblings", () => {
    const onChange = vi.fn();
    function Harness() {
      const [keys, setKeys] = useState<string[]>(["u1"]);
      return (
        <Table
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          onSelectedRowKeysChange={(k, r) => {
            onChange(k, r);
            setKeys(k);
          }}
          rowKey="id"
          selectable
          selectedRowKeys={keys}
        />
      );
    }
    render(<Harness />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[3]); // toggle u3 on
    expect(onChange).toHaveBeenLastCalledWith(
      ["u1", "u3"],
      [USERS[0], USERS[2]]
    );
    const after = screen.getAllByRole("checkbox");
    expect(after[1].getAttribute("aria-checked")).toBe("true"); // u1 untouched
    expect(after[2].getAttribute("aria-checked")).toBe("false"); // u2 untouched
    expect(after[3].getAttribute("aria-checked")).toBe("true");
  });

  it("selection props are inert when selectable is false", () => {
    const getCheckboxProps = vi.fn();
    const { container } = render(
      <Table
        caption="Members"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={getCheckboxProps}
        rowKey="id"
        selectedRowKeys={["u1"]}
      />
    );
    expect(getCheckboxProps).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(container.querySelector('[data-state="selected"]')).toBeNull();
  });

  it("selection: select-all preserves keys absent from the current dataSource", () => {
    const onChange = vi.fn();
    function Harness() {
      const [keys, setKeys] = useState<string[]>(["u1", "missing"]);
      return (
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          onSelectedRowKeysChange={(nextKeys, rows) => {
            onChange(nextKeys, rows);
            setKeys(nextKeys);
          }}
          rowKey="id"
          selectable
          selectedRowKeys={keys}
        />
      );
    }
    render(<Harness />);
    const header = () => screen.getAllByRole("checkbox")[0];
    fireEvent.click(header());
    expect(onChange).toHaveBeenLastCalledWith(
      ["u1", "u2", "u3", "missing"],
      USERS
    );
    fireEvent.click(header());
    expect(onChange).toHaveBeenLastCalledWith(["missing"], []);
  });

  it("selection: select-all preserves selected disabled visible rows", () => {
    const onChange = vi.fn();
    function Harness() {
      const [keys, setKeys] = useState<string[]>(["u1", "u2", "u3"]);
      return (
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          getCheckboxProps={(record) => ({ disabled: record.id === "u1" })}
          onSelectedRowKeysChange={(nextKeys, rows) => {
            onChange(nextKeys, rows);
            setKeys(nextKeys);
          }}
          rowKey="id"
          selectable
          selectedRowKeys={keys}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onChange).toHaveBeenLastCalledWith(["u1"], [USERS[0]]);
  });

  // ---------------------------------------------------------------------------
  // isRowSelectable gate
  // ---------------------------------------------------------------------------

  it("getCheckboxProps disabled rows are excluded from select-all tally", () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={(r) => ({ disabled: r.id === "u1" })}
        onSelectedRowKeysChange={onChange}
        rowKey="id"
        selectable
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    // Per-row disabled state: u1 (index 1) is gated out. base-ui surfaces this
    // through aria-disabled rather than a native attribute since the element
    // is a div.
    const isDisabled = (el: Element) =>
      el.getAttribute("aria-disabled") === "true" ||
      el.hasAttribute("disabled") ||
      el.getAttribute("data-disabled") !== null;
    expect(isDisabled(checkboxes[1])).toBe(true);
    expect(isDisabled(checkboxes[2])).toBe(false);
    expect(isDisabled(checkboxes[3])).toBe(false);
    // Select-all only flips selectable subset.
    fireEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledWith(["u2", "u3"], [USERS[1], USERS[2]]);
    // After all selectable are selected, the header reads "all" (not "mixed").
    const after = screen.getAllByRole("checkbox");
    expect(after[0].getAttribute("aria-checked")).toBe("true");
  });

  // ---------------------------------------------------------------------------
  // Column rendering: dataIndex absent, alignment, width
  // ---------------------------------------------------------------------------

  it("column with no dataIndex and no render produces an empty cell without crashing", () => {
    const columns: TableColumn<User>[] = [
      { key: "name", title: "Name", dataIndex: "name" },
      // No dataIndex, no render — should render nothing safely.
      { key: "blank", title: "Blank" },
    ];
    // Spy on console.error so a React render-time crash would surface here.
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<Table columns={columns} dataSource={USERS} rowKey="id" />);
    err.mockRestore();
    // 3 rows × 2 columns = 6 body cells.
    const bodyRows = getBodyRows();
    expect(bodyRows).toHaveLength(3);
    for (const tr of bodyRows) {
      const cells = within(tr).getAllByRole("cell");
      expect(cells).toHaveLength(2);
      // Second cell is the blank one.
      expect(cells[1].textContent).toBe("");
    }
  });

  it("column with dataIndex missing but render present passes undefined as value", () => {
    const renderFn = vi.fn(() => "RENDERED");
    const columns: TableColumn<User>[] = [
      { key: "x", title: "X", render: renderFn },
    ];
    render(<Table columns={columns} dataSource={[USERS[0]]} rowKey="id" />);
    expect(renderFn).toHaveBeenCalledWith(undefined, USERS[0], 0);
    expect(screen.getByText("RENDERED")).toBeTruthy();
  });

  it("align=center / align=right apply text-* classes to both <th> and <td>", () => {
    const columns: TableColumn<User>[] = [
      { align: "center", dataIndex: "name", key: "name", title: "Name" },
      { align: "right", dataIndex: "age", key: "age", title: "Age" },
    ];
    const { container } = render(
      <Table columns={columns} dataSource={USERS} rowKey="id" />
    );
    const ths = container.querySelectorAll("thead th");
    expect(ths[0].className).toContain("text-center");
    expect(ths[1].className).toContain("text-right");
    const firstBodyRow = container.querySelector("tbody tr");
    const tds = firstBodyRow?.querySelectorAll("td") ?? [];
    expect(tds[0].className).toContain("text-center");
    expect(tds[1].className).toContain("text-right");
  });

  it("width=number is emitted as inline style on <th> and <td>", () => {
    const columns: TableColumn<User>[] = [
      { dataIndex: "name", key: "name", title: "Name", width: 120 },
      { dataIndex: "age", key: "age", title: "Age", width: "20%" },
    ];
    const { container } = render(
      <Table columns={columns} dataSource={USERS} rowKey="id" />
    );
    const ths = container.querySelectorAll("thead th");
    // React serializes number→px on the style attribute.
    expect((ths[0] as HTMLElement).style.width).toBe("120px");
    expect((ths[1] as HTMLElement).style.width).toBe("20%");
    const firstRowTds = container.querySelectorAll("tbody tr:first-child td");
    expect((firstRowTds[0] as HTMLElement).style.width).toBe("120px");
    expect((firstRowTds[1] as HTMLElement).style.width).toBe("20%");
  });

  // ---------------------------------------------------------------------------
  // *ClassName passthrough
  // ---------------------------------------------------------------------------

  it("passes headerClassName / bodyClassName / captionClassName through to thead / tbody / caption", () => {
    const { container } = render(
      <Table
        bodyClassName="my-body"
        caption="Hello"
        captionClassName="my-caption"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        headerClassName="my-header"
        rowKey="id"
      />
    );
    expect(container.querySelector("thead")?.className).toContain("my-header");
    expect(container.querySelector("tbody")?.className).toContain("my-body");
    expect(container.querySelector("caption")?.className).toContain(
      "my-caption"
    );
    expect(container.querySelector("caption")?.textContent).toBe("Hello");
  });

  it("passes string rowClassName to every <tr>", () => {
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowClassName="my-row"
        rowKey="id"
      />
    );
    for (const tr of getBodyRows()) {
      expect(tr.className).toContain("my-row");
    }
  });

  it("passes emptyClassName / loadingClassName to the placeholder cell", () => {
    const { rerender, container } = render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={[]}
        emptyClassName="my-empty"
        rowKey="id"
      />
    );
    expect(container.querySelector("tbody td")?.className).toContain(
      "my-empty"
    );
    rerender(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={[]}
        loading
        loadingClassName="my-loading"
        rowKey="id"
      />
    );
    expect(container.querySelector("tbody td")?.className).toContain(
      "my-loading"
    );
  });

  it("passes selectionColumnClassName to selection <th> and every selection <td>", () => {
    const { container } = render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
        selectionColumnClassName="my-sel"
      />
    );
    const selHead = container.querySelector(
      '[data-slot="easy-table-selection-head"]'
    );
    expect(selHead?.className).toContain("my-sel");
    const selCells = container.querySelectorAll(
      '[data-slot="easy-table-selection-cell"]'
    );
    expect(selCells).toHaveLength(USERS.length);
    for (const cell of selCells) {
      expect(cell.className).toContain("my-sel");
    }
  });

  // ---------------------------------------------------------------------------
  // Duplicate rowKey dev warning
  // ---------------------------------------------------------------------------

  describe("duplicate rowKey warning", () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    const countCallsMatching = (re: RegExp) =>
      warnSpy.mock.calls.filter((c) => re.test(String(c[0]))).length;

    it("warns once when keys collide (same fingerprint = no spam)", () => {
      const dupes: User[] = [
        { age: 1, id: "dup", name: "A" },
        { age: 2, id: "dup", name: "B" },
      ];
      const { rerender } = render(
        // `caption` keeps the unrelated "no accessible name" warn quiet so
        // this assertion stays scoped to the duplicate-key warning.
        <Table
          caption="Users"
          columns={BASIC_COLUMNS}
          dataSource={dupes}
          rowKey="id"
        />
      );
      expect(countCallsMatching(DUP_KEYS_RE)).toBe(1);
      // Re-render with the same dupes — same fingerprint, no spam.
      rerender(
        <Table
          caption="Users"
          columns={BASIC_COLUMNS}
          dataSource={[...dupes]}
          rowKey="id"
        />
      );
      expect(countCallsMatching(DUP_KEYS_RE)).toBe(1);
    });

    it("re-warns when dataSource mutates into a *different* dup fingerprint", () => {
      const clean: User[] = [
        { age: 1, id: "u1", name: "A" },
        { age: 2, id: "u2", name: "B" },
      ];
      const dupesA: User[] = [
        { age: 1, id: "u1", name: "A" },
        { age: 2, id: "u1", name: "B" },
      ];
      const dupesB: User[] = [
        { age: 1, id: "u9", name: "X" },
        { age: 2, id: "u9", name: "Y" },
      ];
      const { rerender } = render(
        <Table
          caption="Users"
          columns={BASIC_COLUMNS}
          dataSource={clean}
          rowKey="id"
        />
      );
      // 1. Mount without dupes — no warn.
      expect(countCallsMatching(DUP_KEYS_RE)).toBe(0);
      // 2. Switch to dupes A — warn once.
      rerender(
        <Table
          caption="Users"
          columns={BASIC_COLUMNS}
          dataSource={dupesA}
          rowKey="id"
        />
      );
      expect(countCallsMatching(DUP_KEYS_RE)).toBe(1);
      // 3. Switch to dupes B (different fingerprint) — warn again.
      rerender(
        <Table
          caption="Users"
          columns={BASIC_COLUMNS}
          dataSource={dupesB}
          rowKey="id"
        />
      );
      expect(countCallsMatching(DUP_KEYS_RE)).toBe(2);
      // 4. Switch back to dupes A (already-seen fingerprint) — no new warn.
      rerender(
        <Table
          caption="Users"
          columns={BASIC_COLUMNS}
          dataSource={dupesA}
          rowKey="id"
        />
      );
      expect(countCallsMatching(DUP_KEYS_RE)).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility — keyboard interaction
  // ---------------------------------------------------------------------------

  it("a11y: row checkboxes have role=checkbox and aria-checked tracks state", () => {
    function Harness() {
      const [keys, setKeys] = useState<string[]>([]);
      return (
        <Table
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          onSelectedRowKeysChange={setKeys}
          rowKey="id"
          selectable
          selectedRowKeys={keys}
        />
      );
    }
    render(<Harness />);
    // All row + header checkboxes are exposed via role=checkbox.
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(USERS.length + 1);
    // Pre-click: all unchecked.
    for (const cb of checkboxes.slice(1)) {
      expect(cb.getAttribute("aria-checked")).toBe("false");
    }
    // Activate (click is the synchronous keyboard-equivalent in base-ui — Space
    // dispatches a click via useButton, but jsdom does not bridge keydown→click).
    fireEvent.click(checkboxes[1]);
    const after = screen.getAllByRole("checkbox");
    expect(after[1].getAttribute("aria-checked")).toBe("true");
    // Each row checkbox carries a descriptive aria-label.
    expect(after[1].getAttribute("aria-label")).toBe("Select row u1");
    // Header carries the bulk-action aria-label.
    expect(after[0].getAttribute("aria-label")).toBe("Select all rows");
  });

  // ---------------------------------------------------------------------------
  // Type-level checks — dataIndex must be keyof T
  // ---------------------------------------------------------------------------

  it("type: dataIndex is constrained to keyof T (compile-time)", () => {
    expectTypeOf<TableColumn<User>["dataIndex"]>().toEqualTypeOf<
      keyof User | undefined
    >();

    // Sanity: valid column compiles.
    const ok: TableColumn<User> = {
      dataIndex: "name",
      key: "name",
      title: "Name",
    };
    expect(ok.key).toBe("name");
  });

  it("type: defineColumns narrows render value and rejects invalid dataIndex", () => {
    // Prove narrowing reached `number` (not `any` / union) by exercising
    // number-only methods inside render and capturing the inferred parameter.
    let capturedAge: number | undefined;
    const cols = defineColumns<User>()([
      {
        dataIndex: "age",
        key: "age",
        render: (value) => {
          // If narrowing failed, `value` would be `any` and `toFixed` would
          // type-check, BUT `expectTypeOf` below would catch the regression.
          capturedAge = value;
          return value.toFixed(0);
        },
        title: "Age",
      },
    ]);
    expect(cols[0].key).toBe("age");
    expect(capturedAge).toBeUndefined(); // render not invoked yet

    // Type-level: the first column's `dataIndex` is the literal "age".
    expectTypeOf<(typeof cols)[0]["dataIndex"]>().toEqualTypeOf<"age">();

    // Invalid dataIndex must be rejected at the builder call. If TS ever loses
    // narrowing in this file, the @ts-expect-error becomes unused and the suite
    // fails fast.
    defineColumns<User>()([
      // @ts-expect-error — "nope" is not keyof User
      { dataIndex: "nope", key: "x", title: "X" },
    ]);
  });

  it("type: rowKey field form only accepts string/number fields", () => {
    interface Row {
      id: string;
      meta: { id: string };
      name: string;
      optionalId?: number;
    }

    render(
      <Table
        caption="Rows"
        columns={[{ dataIndex: "name", key: "name", title: "Name" }]}
        dataSource={[] as Row[]}
        rowKey="optionalId"
      />
    );

    render(
      <Table
        caption="Rows"
        columns={[{ dataIndex: "name", key: "name", title: "Name" }]}
        dataSource={[] as Row[]}
        // @ts-expect-error — object fields stringify to "[object Object]".
        rowKey="meta"
      />
    );
  });

  it("type: non-renderable dataIndex fields require render", () => {
    interface Row {
      createdAt: Date;
      id: string;
      name: string;
    }

    defineColumns<Row>()([
      // @ts-expect-error — Date is not directly renderable as ReactNode.
      { dataIndex: "createdAt", key: "createdAt", title: "Created" },
      {
        dataIndex: "createdAt",
        key: "createdAtFormatted",
        render: (value) => value.toISOString(),
        title: "Created",
      },
      { dataIndex: "name", key: "name", title: "Name" },
    ]);
  });

  it("type: getCheckboxProps cannot control checkbox state", () => {
    const ok: Partial<TableCheckboxProps> = {
      "aria-label": "Select Ada",
      disabled: true,
    };
    expect(ok.disabled).toBe(true);

    const bad: Partial<TableCheckboxProps> = {
      // @ts-expect-error — Table owns row checkbox checked state.
      checked: true,
    };
    expect(bad).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Indeterminate visual (Round 1 fix)
  // ---------------------------------------------------------------------------

  it("indeterminate header renders the dash icon, not the tick", () => {
    // Drive selectedRowKeys directly through props so rerender updates apply.
    const { container, rerender } = render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
        selectedRowKeys={["u1"]}
      />
    );
    // 1 of 3 selected → indeterminate dash.
    let headerIcon = container.querySelector(
      '[data-slot="easy-table-selection-head"] [data-icon]'
    );
    expect(headerIcon?.getAttribute("data-icon")).toBe("indeterminate");

    // All 3 of 3 selected → checked tick.
    rerender(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
        selectedRowKeys={["u1", "u2", "u3"]}
      />
    );
    headerIcon = container.querySelector(
      '[data-slot="easy-table-selection-head"] [data-icon]'
    );
    expect(headerIcon?.getAttribute("data-icon")).toBe("checked");
  });

  // -------------------------------------------------------------------------
  // Round 6 regression — Checkbox.Indicator must NOT render while unchecked.
  // Adding `keepMounted` to the Indicator forced the tick SVG into the DOM
  // for empty rows, which read visually as "checked, transparent theme" and
  // broke every selection demo. These assertions lock the fix.
  // -------------------------------------------------------------------------

  it("unchecked: zero rows selected → no indicator in any row or header", () => {
    const { container } = render(
      <Table
        caption="Empty selection"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
      />
    );
    // No tick / dash icon should be reachable anywhere in the selection column
    // when nothing is selected.
    const icons = container.querySelectorAll(
      '[data-slot="easy-table-selection-head"] [data-icon], [data-slot="easy-table-selection-cell"] [data-icon]'
    );
    expect(icons).toHaveLength(0);
    const indicators = container.querySelectorAll(
      '[data-slot="easy-table-selection-indicator"]'
    );
    expect(indicators).toHaveLength(0);
  });

  it("partial selection: only selected rows show an indicator; others have none", () => {
    const { container } = render(
      <Table
        caption="Partial selection"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
        selectedRowKeys={["u2"]}
      />
    );
    // Header → indeterminate (1 of 3).
    const headerIcon = container.querySelector(
      '[data-slot="easy-table-selection-head"] [data-icon]'
    );
    expect(headerIcon?.getAttribute("data-icon")).toBe("indeterminate");
    // Body → exactly one indicator, in the u2 row, of kind "checked".
    const bodyIcons = container.querySelectorAll(
      '[data-slot="easy-table-selection-cell"] [data-icon]'
    );
    expect(bodyIcons).toHaveLength(1);
    expect(bodyIcons[0].getAttribute("data-icon")).toBe("checked");
  });

  it("full selection: every row shows a tick; header shows tick (not dash)", () => {
    const { container } = render(
      <Table
        caption="Full selection"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
        selectedRowKeys={["u1", "u2", "u3"]}
      />
    );
    const headerIcon = container.querySelector(
      '[data-slot="easy-table-selection-head"] [data-icon]'
    );
    expect(headerIcon?.getAttribute("data-icon")).toBe("checked");
    const bodyIcons = container.querySelectorAll(
      '[data-slot="easy-table-selection-cell"] [data-icon]'
    );
    expect(bodyIcons).toHaveLength(USERS.length);
    for (const icon of bodyIcons) {
      expect(icon.getAttribute("data-icon")).toBe("checked");
    }
  });

  it("disabled-by-getCheckboxProps row is unchecked and has no indicator", () => {
    const { container } = render(
      <Table
        caption="Owner non-selectable"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={(r) => ({ disabled: r.id === "u1" })}
        rowKey="id"
        selectable
        // Select u2 so the partial state mirrors the user-screenshot scenario.
        selectedRowKeys={["u2"]}
      />
    );
    const cells = container.querySelectorAll(
      '[data-slot="easy-table-selection-cell"]'
    );
    // First cell is u1, disabled; should NOT carry an indicator.
    expect(cells[0].querySelector("[data-icon]")).toBeNull();
    // Second cell is u2, selected; SHOULD carry a "checked" indicator.
    expect(
      cells[1].querySelector("[data-icon]")?.getAttribute("data-icon")
    ).toBe("checked");
    // Third cell is u3, unselected & enabled; no indicator.
    expect(cells[2].querySelector("[data-icon]")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Round 7 — disabled checkbox visual must be distinguishable.
  // The previous default (`disabled:opacity-50`) was almost invisible on an
  // already-faint unchecked outline. Lock in the grey-fill + soft-border
  // tokens so a future "tidy-up" doesn't quietly revert the contrast.
  // -------------------------------------------------------------------------

  it("disabled checkbox carries data-disabled and the high-contrast disabled tokens", () => {
    const { container } = render(
      <Table
        caption="Disabled visual"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={(r) => ({ disabled: r.id === "u1" })}
        rowKey="id"
        selectable
      />
    );
    const cb = container.querySelector(
      '[data-slot="easy-table-selection-cell"] [data-slot="easy-table-selection-checkbox"]'
    );
    expect(cb).not.toBeNull();
    // base-ui surfaces disabled state via data-disabled attribute.
    expect(cb?.getAttribute("data-disabled")).not.toBeNull();
    // Class string must carry the new disabled-state tokens so the visual
    // difference vs an enabled-unchecked checkbox is unmistakable. We assert
    // on tokens, not exact ordering, so unrelated tailwind tweaks don't break
    // this guard.
    const cls = cb?.className ?? "";
    expect(cls).toContain("disabled:bg-muted");
    expect(cls).toContain("disabled:border-muted-foreground/30");
    expect(cls).toContain("disabled:cursor-not-allowed");
    // The old weak token must NOT be re-introduced — that was the regression.
    expect(cls).not.toContain("disabled:opacity-50");
  });

  it("checked-disabled checkbox keeps primary fill (data-checked beats data-disabled in the cascade)", () => {
    const { container } = render(
      <Table
        caption="Checked + disabled"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        // u1 is BOTH selected and disabled — covers the "forced selection,
        // not deselectable" UX pattern.
        getCheckboxProps={(r) => ({ disabled: r.id === "u1" })}
        rowKey="id"
        selectable
        selectedRowKeys={["u1"]}
      />
    );
    const cells = container.querySelectorAll(
      '[data-slot="easy-table-selection-cell"]'
    );
    const u1Cb = cells[0].querySelector(
      '[data-slot="easy-table-selection-checkbox"]'
    );
    // Visually shows the tick: indicator + data-icon="checked" present.
    expect(u1Cb?.querySelector('[data-icon="checked"]')).not.toBeNull();
    // Still flagged disabled.
    expect(u1Cb?.getAttribute("data-disabled")).not.toBeNull();
    // The cascade must give us BOTH tokens — checked fills win at render,
    // disabled cursor / border still communicate the gated state.
    const cls = u1Cb?.className ?? "";
    expect(cls).toContain("data-checked:bg-primary");
    expect(cls).toContain("disabled:cursor-not-allowed");
  });

  // ---------------------------------------------------------------------------
  // getCheckboxProps passthrough
  // ---------------------------------------------------------------------------

  it("getCheckboxProps: arbitrary props (data-*, aria-*) pass through to the row Checkbox", () => {
    const { container } = render(
      <Table
        caption="Members"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={(r) => ({
          "aria-label": `cb-${r.id}`,
          "data-row": r.id,
        })}
        rowKey="id"
        selectable
      />
    );
    const u1Cb = container.querySelector('[data-row="u1"]');
    expect(u1Cb).not.toBeNull();
    expect(u1Cb?.getAttribute("aria-label")).toBe("cb-u1");
  });

  it("getCheckboxProps: external checked/onCheckedChange are ignored — Table owns them", () => {
    const externalOnChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Table
        caption="Members"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={() =>
          ({
            checked: true,
            onCheckedChange: externalOnChange,
          }) as never
        }
        onSelectedRowKeysChange={onChange}
        rowKey="id"
        selectable
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    // Despite getCheckboxProps insisting `checked: true`, Table owns state and
    // shows them all as unchecked.
    expect(checkboxes[1].getAttribute("aria-checked")).toBe("false");
    fireEvent.click(checkboxes[1]);
    // Table's own handler fired; external one did not.
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(externalOnChange).not.toHaveBeenCalled();
  });

  it("getCheckboxProps: external indeterminate/defaultChecked/children are ignored", () => {
    const { container } = render(
      <Table
        caption="Members"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={() =>
          ({
            children: <span data-child="forced">forced</span>,
            defaultChecked: true,
            indeterminate: true,
          }) as never
        }
        rowKey="id"
        selectable
      />
    );
    const firstCheckbox = screen.getAllByRole("checkbox")[1];
    expect(firstCheckbox.getAttribute("aria-checked")).toBe("false");
    expect(
      container.querySelector(
        '[data-slot="easy-table-selection-cell"] [data-icon]'
      )
    ).toBeNull();
    expect(container.querySelector("[data-child='forced']")).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // onRowClick + keyboard a11y
  // ---------------------------------------------------------------------------

  it("onRowClick: mouse click on a row fires the handler with (record, index)", () => {
    const onRowClick = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        onRowClick={onRowClick}
        rowKey="id"
      />
    );
    const rows = getBodyRows();
    // Implicit role="row" is preserved (NOT overridden to "button") so screen
    // readers still report this as a table cell row.
    expect(rows[1].tagName).toBe("TR");
    expect(rows[1].getAttribute("role")).toBeNull();
    expect(rows[1].getAttribute("tabindex")).toBe("0");
    fireEvent.click(rows[1]);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(USERS[1], 1);
  });

  it("onRowClick: interactive descendants inside normal cells do not activate the row", () => {
    const onButtonClick = vi.fn();
    const onRowClick = vi.fn();
    const columns = defineColumns<User>()([
      { dataIndex: "name", key: "name", title: "Name" },
      {
        key: "action",
        render: (_value, record) => (
          <button onClick={() => onButtonClick(record.id)} type="button">
            Edit {record.name}
          </button>
        ),
        title: "Action",
      },
    ]);
    render(
      <Table
        caption="Members"
        columns={columns}
        dataSource={USERS}
        onRowClick={onRowClick}
        rowKey="id"
      />
    );

    const button = screen.getByRole("button", { name: "Edit Ada" });
    fireEvent.click(button);
    expect(onButtonClick).toHaveBeenCalledWith("u1");
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.click(getBodyRows()[1]);
    expect(onRowClick).toHaveBeenCalledWith(USERS[1], 1);
  });

  it("onRowClick: Enter and Space both trigger; Space preventDefaults page-scroll", () => {
    const onRowClick = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        onRowClick={onRowClick}
        rowKey="id"
      />
    );
    const rows = getBodyRows();
    fireEvent.keyDown(rows[0], { key: "Enter" });
    expect(onRowClick).toHaveBeenLastCalledWith(USERS[0], 0);
    // Construct a real KeyboardEvent so we can inspect defaultPrevented after
    // dispatch. fireEvent.keyDown with a plain object cannot prove preventDefault
    // was called by the handler.
    const spaceEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: " ",
    });
    rows[2].dispatchEvent(spaceEvent);
    expect(onRowClick).toHaveBeenLastCalledWith(USERS[2], 2);
    expect(onRowClick).toHaveBeenCalledTimes(2);
    expect(spaceEvent.defaultPrevented).toBe(true);
  });

  it("onRowClick: keys other than Enter / Space do not fire the handler", () => {
    const onRowClick = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        onRowClick={onRowClick}
        rowKey="id"
      />
    );
    const rows = getBodyRows();
    fireEvent.keyDown(rows[0], { key: "a" });
    fireEvent.keyDown(rows[0], { key: "Tab" });
    fireEvent.keyDown(rows[0], { key: "ArrowDown" });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("onRowClick: clicks inside the selection cell do not bubble to the row handler", () => {
    const onRowClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        onRowClick={onRowClick}
        onSelectedRowKeysChange={onSelect}
        rowKey="id"
        selectable
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // first row's checkbox
    // Selection handler fires; row handler does NOT.
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
    // Clicking the row body still triggers onRowClick.
    const rows = getBodyRows();
    fireEvent.click(rows[1]);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("onRowClick: key presses inside the selection cell do not bubble to the row handler", () => {
    const onRowClick = vi.fn();
    render(
      <Table
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        onRowClick={onRowClick}
        rowKey="id"
        selectable
      />
    );
    // Dispatch an Enter keydown from inside the selection cell — it must NOT
    // bubble up to the row's onKeyDown handler.
    const selCell = document.querySelector(
      '[data-slot="easy-table-selection-cell"]'
    ) as HTMLElement;
    expect(selCell).toBeTruthy();
    fireEvent.keyDown(selCell, { key: "Enter" });
    expect(onRowClick).not.toHaveBeenCalled();
    fireEvent.keyDown(selCell, { key: " " });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("onRowClick absent → rows have no role/tabIndex", () => {
    render(<Table columns={BASIC_COLUMNS} dataSource={USERS} rowKey="id" />);
    const rows = getBodyRows();
    expect(rows[0].getAttribute("role")).toBeNull();
    expect(rows[0].getAttribute("tabindex")).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // dataSource null/undefined safety (Round 1 fix)
  // ---------------------------------------------------------------------------

  it("dataSource: null/undefined treated as empty array at runtime", () => {
    const { rerender } = render(
      <Table
        caption="Rows"
        columns={BASIC_COLUMNS}
        dataSource={null}
        emptyMessage="EMPTY"
        rowKey="id"
      />
    );
    expect(screen.getByText("EMPTY")).toBeTruthy();
    // `undefined` is the more common SWR / React Query pre-fetch shape.
    rerender(
      <Table
        caption="Rows"
        columns={BASIC_COLUMNS}
        emptyMessage="EMPTY"
        rowKey="id"
      />
    );
    expect(screen.getByText("EMPTY")).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // A11y — Round 4 audit fixes
  // ---------------------------------------------------------------------------

  it("a11y: <table aria-busy> reflects the `loading` prop", () => {
    const { container, rerender } = render(
      <Table
        caption="Tasks"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
      />
    );
    // Default: not loading, no aria-busy attribute at all (passes truthy-only).
    expect(container.querySelector("table")?.getAttribute("aria-busy")).toBe(
      null
    );
    rerender(
      <Table
        caption="Tasks"
        columns={BASIC_COLUMNS}
        dataSource={[]}
        loading
        rowKey="id"
      />
    );
    expect(container.querySelector("table")?.getAttribute("aria-busy")).toBe(
      "true"
    );
  });

  it("a11y: managed table attrs are not overridden by passthrough props", () => {
    const { container } = render(
      <Table
        aria-busy={false}
        caption="Tasks"
        columns={BASIC_COLUMNS}
        data-slot="consumer-table"
        dataSource={[]}
        loading
        rowKey="id"
      />
    );
    const table = container.querySelector("table");
    expect(table?.getAttribute("aria-busy")).toBe("true");
    expect(table?.getAttribute("data-slot")).toBe("easy-table");
  });

  it("a11y: loading and empty cells contain role=status for SR announcement", () => {
    const { container, rerender } = render(
      <Table
        caption="Tasks"
        columns={BASIC_COLUMNS}
        dataSource={[]}
        emptyMessage="EMPTY"
        rowKey="id"
      />
    );
    const emptyCell = container.querySelector("tbody td");
    const emptyStatus = within(emptyCell as HTMLElement).getByRole("status");
    expect(emptyCell?.getAttribute("role")).toBeNull();
    expect(emptyStatus.textContent).toBe("EMPTY");
    rerender(
      <Table
        caption="Tasks"
        columns={BASIC_COLUMNS}
        dataSource={[]}
        loading
        loadingMessage="LOADING"
        rowKey="id"
      />
    );
    const loadingCell = container.querySelector("tbody td");
    const loadingStatus = within(loadingCell as HTMLElement).getByRole(
      "status"
    );
    expect(loadingCell?.getAttribute("role")).toBeNull();
    expect(loadingStatus.textContent).toBe("LOADING");
  });

  it("a11y: selection <th> renders an SR-only column label", () => {
    const { container } = render(
      <Table
        caption="Members"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
      />
    );
    const head = container.querySelector(
      '[data-slot="easy-table-selection-head"]'
    );
    const srSpan = head?.querySelector("span.sr-only");
    expect(srSpan?.textContent).toBe("Selection");
  });

  it("a11y: selectionColumnLabel overrides the default SR-only label", () => {
    const { container } = render(
      <Table
        caption="Members"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        rowKey="id"
        selectable
        selectionColumnLabel="Choose member"
      />
    );
    const srSpan = container.querySelector(
      '[data-slot="easy-table-selection-head"] span.sr-only'
    );
    expect(srSpan?.textContent).toBe("Choose member");
  });

  it("a11y: getCheckboxProps `aria-label` overrides the opaque default", () => {
    const { container } = render(
      <Table
        caption="Members"
        columns={BASIC_COLUMNS}
        dataSource={USERS}
        getCheckboxProps={(r) => ({ "aria-label": `Select ${r.name}` })}
        rowKey="id"
        selectable
      />
    );
    const cbs = container.querySelectorAll(
      '[data-slot="easy-table-selection-cell"] [role="checkbox"]'
    );
    // First body row is u1 / Ada.
    expect(cbs[0]?.getAttribute("aria-label")).toBe("Select Ada");
  });

  describe("dev warnings: nameless table + controlled/default conflict", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => {
      warnSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    const callsMatching = (re: RegExp) =>
      warnSpy.mock.calls.filter((c) => re.test(String(c[0]))).length;

    it("warns once when the table has no caption / aria-label / aria-labelledby", () => {
      const { rerender } = render(
        <Table columns={BASIC_COLUMNS} dataSource={USERS} rowKey="id" />
      );
      expect(callsMatching(NO_NAME_RE)).toBe(1);
      // Subsequent renders of the same instance don't repeat.
      rerender(
        <Table columns={BASIC_COLUMNS} dataSource={[...USERS]} rowKey="id" />
      );
      expect(callsMatching(NO_NAME_RE)).toBe(1);
    });

    it("does NOT warn when caption is provided", () => {
      render(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
        />
      );
      expect(callsMatching(NO_NAME_RE)).toBe(0);
    });

    it("does NOT warn when aria-label is provided", () => {
      render(
        <Table
          aria-label="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
        />
      );
      expect(callsMatching(NO_NAME_RE)).toBe(0);
    });

    it("warns once when both selectedRowKeys and defaultSelectedRowKeys are passed", () => {
      render(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          defaultSelectedRowKeys={["u1"]}
          rowKey="id"
          selectable
          selectedRowKeys={["u2"]}
        />
      );
      expect(callsMatching(BOTH_SELECTED_RE)).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Round 5 — edge cases & extra dev warnings
  // ---------------------------------------------------------------------------

  describe("rowKey value diagnostics (round 5)", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => {
      warnSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    const callsMatching = (re: RegExp) =>
      warnSpy.mock.calls.filter((c) => re.test(String(c[0]))).length;

    it("warns when rowKey resolves to null / undefined on any row", () => {
      type Rec = { id: string | null | undefined; name: string };
      const rows: Rec[] = [
        { id: "u1", name: "A" },
        { id: null, name: "B" },
        { id: undefined, name: "C" },
      ];
      render(
        <Table
          caption="Diag"
          columns={[{ dataIndex: "name", key: "name", title: "Name" }]}
          dataSource={rows}
          rowKey="id"
        />
      );
      expect(callsMatching(NULLISH_KEY_RE)).toBe(1);
    });

    it("warns when rowKey resolves to a Symbol on any row", () => {
      type Rec = { id: string | symbol; name: string };
      const rows: Rec[] = [
        { id: "u1", name: "A" },
        { id: Symbol("u2"), name: "B" },
      ];
      render(
        <Table
          caption="Diag"
          columns={[{ dataIndex: "name", key: "name", title: "Name" }]}
          dataSource={rows}
          rowKey={(record) => record.id as unknown as string}
        />
      );
      expect(callsMatching(SYMBOL_KEY_RE)).toBe(1);
    });

    it("warns when rowKey resolves to a non-string / non-number value at runtime", () => {
      type Rec = { id: { value: string }; name: string };
      const rows: Rec[] = [{ id: { value: "u1" }, name: "A" }];
      render(
        <Table
          caption="Diag"
          columns={[{ dataIndex: "name", key: "name", title: "Name" }]}
          dataSource={rows}
          rowKey={(record) => record.id as unknown as string}
        />
      );
      expect(callsMatching(INVALID_KEY_RE)).toBe(1);
    });
  });

  describe("column key dedupe (round 5)", () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    const callsMatching = (re: RegExp) =>
      warnSpy.mock.calls.filter((c) => re.test(String(c[0]))).length;

    it("warns when two columns share the same key", () => {
      const dupCols: TableColumn<User>[] = [
        { dataIndex: "name", key: "x", title: "Name" },
        { dataIndex: "age", key: "x", title: "Age" },
      ];
      render(
        <Table
          caption="DupCols"
          columns={dupCols}
          dataSource={USERS}
          rowKey="id"
        />
      );
      expect(callsMatching(DUP_COL_KEYS_RE)).toBe(1);
    });

    it("does not warn when all column keys are unique", () => {
      render(
        <Table
          caption="OK"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
        />
      );
      expect(callsMatching(DUP_COL_KEYS_RE)).toBe(0);
    });
  });

  describe("controlled / uncontrolled switch (round 5)", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => {
      warnSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    const callsMatching = (re: RegExp) =>
      warnSpy.mock.calls.filter((c) => re.test(String(c[0]))).length;

    it("warns when an uncontrolled Table flips to controlled mid-life", () => {
      const { rerender } = render(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
          selectable
        />
      );
      expect(callsMatching(CONTROLLED_SWITCH_RE)).toBe(0);
      rerender(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
          selectable
          selectedRowKeys={["u1"]}
        />
      );
      expect(callsMatching(CONTROLLED_SWITCH_RE)).toBe(1);
    });

    it("warns when a controlled Table flips to uncontrolled mid-life", () => {
      const { rerender } = render(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
          selectable
          selectedRowKeys={[]}
        />
      );
      expect(callsMatching(CONTROLLED_SWITCH_RE)).toBe(0);
      rerender(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
          selectable
        />
      );
      expect(callsMatching(CONTROLLED_SWITCH_RE)).toBe(1);
    });

    it("no warn on stable controlled or stable uncontrolled re-renders", () => {
      const { rerender } = render(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
          selectable
          selectedRowKeys={["u1"]}
        />
      );
      rerender(
        <Table
          caption="Members"
          columns={BASIC_COLUMNS}
          dataSource={USERS}
          rowKey="id"
          selectable
          selectedRowKeys={["u2"]}
        />
      );
      expect(callsMatching(CONTROLLED_SWITCH_RE)).toBe(0);
    });
  });
});
