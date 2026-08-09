import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

const PAGE_NUMBER_PATTERN = /^\d+$/;

describe("Pagination — client paging", () => {
  it("updates an uncontrolled current page and notifies the consumer", () => {
    const onValueChange = vi.fn();
    render(<Pagination onValueChange={onValueChange} total={25} />);

    const firstPage = screen.getByRole("button", { name: "1" });
    const secondPage = screen.getByRole("button", { name: "2" });

    expect(firstPage.getAttribute("aria-current")).toBe("page");
    expect(secondPage.hasAttribute("href")).toBe(false);

    fireEvent.click(secondPage);

    expect(onValueChange).toHaveBeenCalledWith(2);
    expect(secondPage.getAttribute("aria-current")).toBe("page");
  });

  it("supports Enter and Space while keeping current and boundary controls inert", () => {
    const onValueChange = vi.fn();
    render(
      <Pagination defaultValue={2} onValueChange={onValueChange} total={30} />
    );

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole("button", { name: "3" }), {
      key: "Enter",
    });
    expect(onValueChange).toHaveBeenLastCalledWith(3);

    const next = screen.getByRole("button", { name: "Go to next page" });
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(next.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(next);
    fireEvent.keyDown(next, { key: " " });
    expect(onValueChange).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole("button", { name: "2" }), {
      key: " ",
    });
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it("keeps controlled values authoritative until the caller rerenders", () => {
    const onValueChange = vi.fn();
    const view = render(
      <Pagination onValueChange={onValueChange} total={40} value={2} />
    );

    fireEvent.click(screen.getByRole("button", { name: "3" }));

    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(
      screen.getByRole("button", { name: "2" }).getAttribute("aria-current")
    ).toBe("page");

    view.rerender(
      <Pagination onValueChange={onValueChange} total={40} value={3} />
    );
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");
  });
});

describe("Pagination — compact range", () => {
  it("bounds huge boundary and sibling windows while preserving key targets", () => {
    const currentValue = Math.floor(Number.MAX_SAFE_INTEGER / 2);
    const getPageHref = vi.fn((page: number) => `/pages/${page}`);
    const { container } = render(
      <Pagination
        boundaryCount={Number.MAX_SAFE_INTEGER + 1}
        getPageHref={getPageHref}
        pageSize={1}
        siblingCount={Number.MAX_SAFE_INTEGER + 1}
        total={Number.MAX_SAFE_INTEGER}
        value={currentValue}
      />
    );

    expect(
      container.querySelectorAll('[data-slot="pagination-item"]').length
    ).toBeLessThanOrEqual(405);
    expect(screen.getByRole("link", { name: "1" }).getAttribute("href")).toBe(
      "/pages/1"
    );
    expect(
      screen
        .getByRole("link", { name: String(currentValue) })
        .getAttribute("aria-current")
    ).toBe("page");
    expect(
      screen
        .getByRole("link", { name: String(Number.MAX_SAFE_INTEGER) })
        .getAttribute("href")
    ).toBe(`/pages/${Number.MAX_SAFE_INTEGER}`);
    expect(getPageHref.mock.calls.flat()).toSatisfy((targets: number[]) =>
      targets.every(Number.isSafeInteger)
    );
  });

  it("keeps the first and last page windows observable at their edges", () => {
    const view = render(
      <Pagination onValueChange={vi.fn()} total={1000} value={1} />
    );
    const generated = () =>
      [...view.container.querySelectorAll('[data-slot="pagination-item"]')]
        .slice(1, -1)
        .map((item) =>
          item.querySelector('[data-slot="pagination-ellipsis"]')
            ? "ellipsis"
            : item.textContent
        );

    expect(generated()).toEqual(["1", "2", "ellipsis", "100"]);

    view.rerender(
      <Pagination onValueChange={vi.fn()} total={1000} value={100} />
    );
    expect(generated()).toEqual(["1", "ellipsis", "99", "100"]);
  });

  it("renders boundaries, siblings, and ellipses instead of every page", () => {
    const { container } = render(
      <Pagination onValueChange={vi.fn()} total={1000} value={50} />
    );
    const generated = [
      ...container.querySelectorAll('[data-slot="pagination-item"]'),
    ]
      .slice(1, -1)
      .map((item) =>
        item.querySelector('[data-slot="pagination-ellipsis"]')
          ? "ellipsis"
          : item.textContent
      );

    expect(generated).toEqual([
      "1",
      "ellipsis",
      "49",
      "50",
      "51",
      "ellipsis",
      "100",
    ]);
  });

  it("deduplicates overlapping custom boundary and sibling windows", () => {
    const { container } = render(
      <Pagination
        boundaryCount={3}
        onValueChange={vi.fn()}
        siblingCount={2}
        total={200}
        value={5}
      />
    );
    const generated = [
      ...container.querySelectorAll('[data-slot="pagination-item"]'),
    ]
      .slice(1, -1)
      .map((item) =>
        item.querySelector('[data-slot="pagination-ellipsis"]')
          ? "ellipsis"
          : item.textContent
      );

    expect(generated).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "ellipsis",
      "18",
      "19",
      "20",
    ]);
  });

  it("expands single-page gaps and stays compact for very large totals", () => {
    const view = render(
      <Pagination
        boundaryCount={1}
        onValueChange={vi.fn()}
        siblingCount={0}
        total={50}
        value={3}
      />
    );
    const numericText = () =>
      [...screen.getAllByRole("button")]
        .map((control) => control.textContent)
        .filter((text) => PAGE_NUMBER_PATTERN.test(text ?? ""));

    expect(numericText()).toEqual(["1", "2", "3", "4", "5"]);
    expect(
      view.container.querySelector('[data-slot="pagination-ellipsis"]')
    ).toBeNull();

    view.rerender(
      <Pagination
        onValueChange={vi.fn()}
        total={10_000_000_000}
        value={500_000_000}
      />
    );
    expect(
      view.container.querySelectorAll('[data-slot="pagination-item"]').length
    ).toBeLessThanOrEqual(9);
  });
});

describe("Pagination — route navigation", () => {
  it("disables only the unavailable Previous or Next link at each boundary", () => {
    const view = render(
      <Pagination
        getPageHref={(page) => `/reports?page=${page}`}
        total={30}
        value={1}
      />
    );

    const previous = screen.getByRole("link", {
      name: "Go to previous page",
    });
    const next = screen.getByRole("link", { name: "Go to next page" });
    expect(previous.hasAttribute("href")).toBe(false);
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    expect(previous.getAttribute("tabindex")).toBe("-1");
    expect(next.getAttribute("href")).toBe("/reports?page=2");
    expect(next.hasAttribute("aria-disabled")).toBe(false);
    expect(next.getAttribute("tabindex")).not.toBe("-1");

    view.rerender(
      <Pagination
        getPageHref={(page) => `/reports?page=${page}`}
        total={30}
        value={3}
      />
    );
    expect(previous.getAttribute("href")).toBe("/reports?page=2");
    expect(previous.hasAttribute("aria-disabled")).toBe(false);
    expect(previous.getAttribute("tabindex")).not.toBe("-1");
    expect(next.hasAttribute("href")).toBe(false);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(next.getAttribute("tabindex")).toBe("-1");
  });

  it("renders genuine links without intercepting clicks or keyboard events", () => {
    render(
      <Pagination
        getPageHref={(page) => `/reports?page=${page}`}
        total={30}
        value={2}
      />
    );

    const pageTwo = screen.getByRole("link", { name: "2" });
    const previous = screen.getByRole("link", {
      name: "Go to previous page",
    });
    const next = screen.getByRole("link", { name: "Go to next page" });

    expect(pageTwo.getAttribute("href")).toBe("/reports?page=2");
    expect(previous.getAttribute("href")).toBe("/reports?page=1");
    expect(next.getAttribute("href")).toBe("/reports?page=3");
    expect(pageTwo.getAttribute("role")).toBe("link");

    const expectNativeClick = (event: MouseEvent) => {
      let preventedByPagination = true;
      document.addEventListener(
        "click",
        (documentEvent) => {
          preventedByPagination = documentEvent.defaultPrevented;
          documentEvent.preventDefault();
        },
        { once: true }
      );
      pageTwo.dispatchEvent(event);
      expect(preventedByPagination).toBe(false);
    };

    expectNativeClick(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    expectNativeClick(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      })
    );
    expectNativeClick(
      new MouseEvent("click", {
        bubbles: true,
        button: 1,
        cancelable: true,
      })
    );

    const expectNativeKeyDown = (key: string) => {
      let preventedByPagination = true;
      document.addEventListener(
        "keydown",
        (documentEvent) => {
          preventedByPagination = documentEvent.defaultPrevented;
          documentEvent.preventDefault();
        },
        { once: true }
      );
      pageTwo.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key })
      );
      expect(preventedByPagination).toBe(false);
    };

    expectNativeKeyDown("Enter");
    expectNativeKeyDown(" ");
  });
});

describe("Pagination — disabled and visibility", () => {
  it("makes every generated client and navigation control inert", () => {
    const onValueChange = vi.fn();
    const client = render(
      <Pagination disabled onValueChange={onValueChange} total={30} />
    );
    const clientControls = [
      ...client.container.querySelectorAll('[data-slot="pagination-link"]'),
    ];

    for (const control of clientControls) {
      expect(control.getAttribute("aria-disabled")).toBe("true");
      expect(control.getAttribute("tabindex")).toBe("-1");
      expect(control.hasAttribute("href")).toBe(false);
      fireEvent.click(control);
      fireEvent.keyDown(control, { key: "Enter" });
      fireEvent.keyDown(control, { key: " " });
    }
    expect(onValueChange).not.toHaveBeenCalled();

    client.unmount();
    const getPageHref = vi.fn((page: number) => `/pages/${page}`);
    const navigation = render(
      <Pagination disabled getPageHref={getPageHref} total={30} value={2} />
    );
    const navigationControls = [
      ...navigation.container.querySelectorAll('[data-slot="pagination-link"]'),
    ];

    expect(getPageHref).not.toHaveBeenCalled();
    expect(
      navigationControls.every(
        (control) =>
          control.getAttribute("aria-disabled") === "true" &&
          control.getAttribute("tabindex") === "-1" &&
          !control.hasAttribute("href")
      )
    ).toBe(true);
  });

  it("removes only a single-page landmark when requested", () => {
    const view = render(
      <Pagination hideOnSinglePage onValueChange={vi.fn()} total={0} />
    );

    expect(screen.queryByRole("navigation")).toBeNull();

    view.rerender(
      <Pagination hideOnSinglePage onValueChange={vi.fn()} total={11} />
    );
    expect(screen.getByRole("navigation", { name: "pagination" })).toBeTruthy();
  });
});

describe("Pagination — normalization and reconciliation", () => {
  it.each([
    ["negative", -25],
    ["zero", 0],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("normalizes a %s total to the single-page lower bound", (_, total) => {
    render(<Pagination onValueChange={vi.fn()} total={total} value={2} />);

    expect(
      screen.getByRole("button", { name: "1" }).getAttribute("aria-current")
    ).toBe("page");
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
  });

  it("normalizes pageSize lower bounds, infinities, and unsafe finite values", () => {
    const view = render(
      <Pagination onValueChange={vi.fn()} pageSize={-1} total={3} value={3} />
    );
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");

    view.rerender(
      <Pagination onValueChange={vi.fn()} pageSize={0} total={3} value={3} />
    );
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");

    for (const pageSize of [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      view.rerender(
        <Pagination
          onValueChange={vi.fn()}
          pageSize={pageSize}
          total={11}
          value={2}
        />
      );
      expect(
        screen.getByRole("button", { name: "2" }).getAttribute("aria-current")
      ).toBe("page");
    }

    view.rerender(
      <Pagination
        onValueChange={vi.fn()}
        pageSize={Number.MAX_SAFE_INTEGER + 1}
        total={Number.MAX_SAFE_INTEGER}
        value={2}
      />
    );
    expect(
      screen.getByRole("button", { name: "1" }).getAttribute("aria-current")
    ).toBe("page");
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
  });

  it("normalizes boundaryCount lower bounds, infinities, and unsafe finite values", () => {
    const view = render(
      <Pagination
        boundaryCount={-1}
        onValueChange={vi.fn()}
        siblingCount={0}
        total={1000}
        value={50}
      />
    );
    const generated = () =>
      [...view.container.querySelectorAll('[data-slot="pagination-item"]')]
        .slice(1, -1)
        .map((item) =>
          item.querySelector('[data-slot="pagination-ellipsis"]')
            ? "ellipsis"
            : item.textContent
        );

    expect(generated()).toEqual(["50"]);
    view.rerender(
      <Pagination
        boundaryCount={0}
        onValueChange={vi.fn()}
        siblingCount={0}
        total={1000}
        value={50}
      />
    );
    expect(generated()).toEqual(["50"]);

    for (const boundaryCount of [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      view.rerender(
        <Pagination
          boundaryCount={boundaryCount}
          onValueChange={vi.fn()}
          siblingCount={0}
          total={1000}
          value={50}
        />
      );
      expect(generated()).toEqual(["1", "ellipsis", "50", "ellipsis", "100"]);
    }

    view.rerender(
      <Pagination
        boundaryCount={Number.MAX_SAFE_INTEGER + 1}
        onValueChange={vi.fn()}
        siblingCount={0}
        total={1000}
        value={50}
      />
    );
    expect(generated()).toHaveLength(100);
    expect(generated().at(0)).toBe("1");
    expect(generated().at(-1)).toBe("100");
    expect(generated()).not.toContain("ellipsis");
  });

  it("normalizes siblingCount lower bounds, infinities, and unsafe finite values", () => {
    const view = render(
      <Pagination
        boundaryCount={0}
        onValueChange={vi.fn()}
        siblingCount={-1}
        total={1000}
        value={50}
      />
    );
    const generated = () =>
      [...view.container.querySelectorAll('[data-slot="pagination-item"]')]
        .slice(1, -1)
        .map((item) => item.textContent);

    expect(generated()).toEqual(["50"]);
    view.rerender(
      <Pagination
        boundaryCount={0}
        onValueChange={vi.fn()}
        siblingCount={0}
        total={1000}
        value={50}
      />
    );
    expect(generated()).toEqual(["50"]);

    for (const siblingCount of [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      view.rerender(
        <Pagination
          boundaryCount={0}
          onValueChange={vi.fn()}
          siblingCount={siblingCount}
          total={1000}
          value={50}
        />
      );
      expect(generated()).toEqual(["49", "50", "51"]);
    }

    view.rerender(
      <Pagination
        boundaryCount={0}
        onValueChange={vi.fn()}
        siblingCount={Number.MAX_SAFE_INTEGER + 1}
        total={1000}
        value={50}
      />
    );
    expect(generated()).toHaveLength(100);
    expect(generated().at(0)).toBe("1");
    expect(generated().at(-1)).toBe("100");
  });

  it("clamps unsafe total and value inputs before producing navigation targets", () => {
    const getPageHref = vi.fn((page: number) => `/pages/${page}`);
    render(
      <Pagination
        boundaryCount={0}
        getPageHref={getPageHref}
        pageSize={1}
        siblingCount={0}
        total={Number.MAX_SAFE_INTEGER + 1}
        value={Number.MAX_SAFE_INTEGER + 1}
      />
    );

    expect(
      screen
        .getByRole("link", { name: String(Number.MAX_SAFE_INTEGER) })
        .getAttribute("aria-current")
    ).toBe("page");
    const next = screen.getByRole("link", { name: "Go to next page" });
    expect(next.hasAttribute("href")).toBe(false);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(getPageHref.mock.calls.flat()).toSatisfy((targets: number[]) =>
      targets.every(Number.isSafeInteger)
    );
  });

  it.each([
    ["negative", -2, 1],
    ["zero", 0, 1],
    ["positive infinity", Number.POSITIVE_INFINITY, 1],
    ["negative infinity", Number.NEGATIVE_INFINITY, 1],
    ["unsafe finite", Number.MAX_SAFE_INTEGER + 1, 3],
  ])("normalizes a %s controlled value", (_, value, expectedValue) => {
    render(
      <Pagination onValueChange={vi.fn()} total={30} value={value as number} />
    );

    expect(
      screen
        .getByRole("button", { name: String(expectedValue) })
        .getAttribute("aria-current")
    ).toBe("page");
  });

  it.each([
    ["negative", -2, 1],
    ["zero", 0, 1],
    ["positive infinity", Number.POSITIVE_INFINITY, 1],
    ["negative infinity", Number.NEGATIVE_INFINITY, 1],
    ["unsafe finite", Number.MAX_SAFE_INTEGER + 1, 3],
  ])("normalizes a %s uncontrolled defaultValue", (_, defaultValue, expected) => {
    render(
      <Pagination
        defaultValue={defaultValue as number}
        onValueChange={vi.fn()}
        total={30}
      />
    );

    expect(
      screen
        .getByRole("button", { name: String(expected) })
        .getAttribute("aria-current")
    ).toBe("page");
  });

  it("truncates finite inputs and applies the documented non-finite fallbacks", () => {
    const view = render(
      <Pagination
        boundaryCount={0.9}
        onValueChange={vi.fn()}
        pageSize={10.9}
        siblingCount={0.9}
        total={25.9}
        value={2.9}
      />
    );

    expect(
      screen.getByRole("button", { name: "2" }).getAttribute("aria-current")
    ).toBe("page");
    expect(screen.queryByRole("button", { name: "3" })).toBeNull();

    view.rerender(
      <Pagination
        boundaryCount={Number.NaN}
        onValueChange={vi.fn()}
        pageSize={Number.POSITIVE_INFINITY}
        siblingCount={Number.NEGATIVE_INFINITY}
        total={Number.NaN}
        value={Number.POSITIVE_INFINITY}
      />
    );

    expect(
      screen.getByRole("button", { name: "1" }).getAttribute("aria-current")
    ).toBe("page");
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
  });

  it("clamps controlled rendering without emitting corrective callbacks", () => {
    const onValueChange = vi.fn();
    render(
      <Pagination onValueChange={onValueChange} total={30} value={999.9} />
    );

    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: "Go to previous page" })
    );
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("silently settles uncontrolled state when the page count shrinks", () => {
    const onValueChange = vi.fn();
    const view = render(
      <Pagination defaultValue={8} onValueChange={onValueChange} total={100} />
    );

    expect(
      screen.getByRole("button", { name: "8" }).getAttribute("aria-current")
    ).toBe("page");

    view.rerender(<Pagination onValueChange={onValueChange} total={30} />);
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");
    expect(onValueChange).not.toHaveBeenCalled();

    view.rerender(<Pagination onValueChange={onValueChange} total={100} />);
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");
  });

  it.each([
    ["Previous", "Go to previous page", 2],
    ["Next", "Go to next page", 4],
    ["numbered", "1", 1],
  ])("starts a %s activation from pageSize-reconciled uncontrolled state", (_, accessibleName, expectedValue) => {
    const onValueChange = vi.fn();
    const view = render(
      <Pagination
        defaultValue={8}
        onValueChange={onValueChange}
        pageSize={10}
        total={100}
      />
    );

    view.rerender(
      <Pagination onValueChange={onValueChange} pageSize={40} total={100} />
    );
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");
    expect(onValueChange).not.toHaveBeenCalled();

    view.rerender(
      <Pagination onValueChange={onValueChange} pageSize={10} total={100} />
    );
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-current")
    ).toBe("page");

    fireEvent.click(screen.getByRole("button", { name: accessibleName }));
    expect(onValueChange).toHaveBeenCalledWith(expectedValue);
    expect(
      screen
        .getByRole("button", { name: String(expectedValue) })
        .getAttribute("aria-current")
    ).toBe("page");
  });
});

describe("Pagination — primitive class targets", () => {
  it("routes every static class override to its named primitive part", () => {
    const { container } = render(
      <Pagination
        className="root-x"
        contentClassName="content-x"
        ellipsisClassName="ellipsis-x"
        itemClassName="item-x"
        linkClassName="link-x"
        nextClassName="next-x"
        onValueChange={vi.fn()}
        previousClassName="previous-x"
        total={1000}
        value={50}
      />
    );

    expect(
      container.querySelector('[data-slot="pagination"]')?.className
    ).toContain("root-x");
    expect(
      container.querySelector('[data-slot="pagination-content"]')?.className
    ).toContain("content-x");
    expect(
      [...container.querySelectorAll('[data-slot="pagination-item"]')].every(
        (item) => item.className.includes("item-x")
      )
    ).toBe(true);
    expect(
      container.querySelector('[data-slot="pagination-ellipsis"]')?.className
    ).toContain("ellipsis-x");
    expect(screen.getByLabelText("Go to previous page").className).toContain(
      "previous-x"
    );
    expect(screen.getByLabelText("Go to next page").className).toContain(
      "next-x"
    );
    expect(screen.getByRole("button", { name: "50" }).className).toContain(
      "link-x"
    );
    expect(
      screen.getByLabelText("Go to previous page").className
    ).not.toContain("link-x");
  });
});

describe("Pagination — root integration and ownership", () => {
  it("forwards native navigation props, accessible naming, events, and ref", () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLElement>();
    render(
      <>
        <span id="result-pages-label">Result pages</span>
        <Pagination
          aria-labelledby="result-pages-label"
          data-testid="result-pagination"
          id="results-pages"
          onClick={onClick}
          onValueChange={vi.fn()}
          ref={ref}
          style={{ opacity: 0.5 }}
          total={30}
        />
      </>
    );

    const root = screen.getByRole("navigation", { name: "Result pages" });
    fireEvent.click(root);

    expect(root.id).toBe("results-pages");
    expect(root.getAttribute("data-testid")).toBe("result-pagination");
    expect((root as HTMLElement).style.opacity).toBe("0.5");
    expect(onClick).toHaveBeenCalledOnce();
    expect(ref.current).toBe(root);
  });

  it("ignores hostile runtime attempts to replace owned root semantics", () => {
    const hostileProps = {
      children: "Forged children",
      dangerouslySetInnerHTML: { __html: "Forged HTML" },
      "data-slot": "forged",
      onValueChange: vi.fn(),
      role: "presentation",
      total: 30,
    } as unknown as Parameters<typeof Pagination>[0];
    const { container } = render(<Pagination {...hostileProps} />);
    const root = screen.getByRole("navigation", { name: "pagination" });

    expect(root.getAttribute("data-slot")).toBe("pagination");
    expect(root.textContent).not.toContain("Forged");
    expect(
      container.querySelector('[data-slot="pagination-content"]')
    ).not.toBeNull();
  });

  it("renders deterministic navigation markup on the server", () => {
    const props = {
      getPageHref: (page: number) => `/reports?page=${page}`,
      total: 100,
      value: 5,
    } as const;

    expect(renderToStaticMarkup(<Pagination {...props} />)).toBe(
      renderToStaticMarkup(<Pagination {...props} />)
    );
  });
});
