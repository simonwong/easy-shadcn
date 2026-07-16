import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Sheet } from "./sheet";

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`);

const renderSheet = (props: Partial<Parameters<typeof Sheet>[0]> = {}) =>
  render(
    <Sheet
      content="Account settings"
      title="Edit account"
      trigger={<button type="button">Open settings</button>}
      {...props}
    />
  );

describe("Sheet — accessible baseline", () => {
  it("uses the caller element as its trigger and stays closed by default", () => {
    renderSheet();

    const trigger = screen.getByRole("button", { name: "Open settings" });

    expect(trigger.getAttribute("data-slot")).toBe("sheet-trigger");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens an accessible right-side sheet with a dedicated body", async () => {
    renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Edit account",
    });
    expect(dialog.getAttribute("data-side")).toBe("right");
    expect(slot("sheet-title")?.textContent).toBe("Edit account");
    expect(slot("sheet-body")?.textContent).toBe("Account settings");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    });
  });
});

describe("Sheet — native open lifecycle", () => {
  it("supports initially open uncontrolled state and Escape dismissal", async () => {
    const onOpenChange = vi.fn();
    renderSheet({ defaultOpen: true, onOpenChange });

    const dialog = screen.getByRole("dialog", { name: "Edit account" });
    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" })
    );
  });

  it("keeps controlled open state authoritative until rerender", async () => {
    const onOpenChange = vi.fn();
    const view = render(
      <Sheet
        content="Account settings"
        onOpenChange={onOpenChange}
        open={false}
        title="Edit account"
        trigger={<button type="button">Open settings</button>}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "trigger-press" })
    );

    view.rerender(
      <Sheet
        content="Account settings"
        onOpenChange={onOpenChange}
        open
        title="Edit account"
        trigger={<button type="button">Open settings</button>}
      />
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Edit account",
    });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(dialog).toBeTruthy();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "close-press" })
    );
  });

  it("preserves native cancellation of an open request", () => {
    const onOpenChange = vi.fn((_open, details) => {
      details.cancel();
    });
    renderSheet({ onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "trigger-press" })
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("forwards transition-complete notifications", async () => {
    const onOpenChangeComplete = vi.fn();
    renderSheet({ onOpenChangeComplete });

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));

    await screen.findByRole("dialog", { name: "Edit account" });
    await waitFor(() => {
      expect(onOpenChangeComplete).toHaveBeenCalledWith(true);
    });
  });
});

describe("Sheet — placements and close control", () => {
  it.each([
    "top",
    "right",
    "bottom",
    "left",
  ] as const)("forwards the %s side to the shadcn content", (side) => {
    renderSheet({ defaultOpen: true, side });

    expect(
      screen
        .getByRole("dialog", { name: "Edit account" })
        .getAttribute("data-side")
    ).toBe(side);
  });

  it("closes an uncontrolled sheet from the built-in close button", async () => {
    renderSheet({ defaultOpen: true });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("can hide the built-in close button", () => {
    renderSheet({ defaultOpen: true, showCloseButton: false });

    expect(screen.getByRole("dialog", { name: "Edit account" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });
});

describe("Sheet — content slots and layout", () => {
  it("renders description, body, and footer with their class targets", () => {
    renderSheet({
      className: "popup-x",
      contentClassName: "body-x",
      defaultOpen: true,
      description: "Update the account details.",
      descriptionClassName: "description-x",
      footer: <button type="button">Save changes</button>,
      footerClassName: "footer-x",
      headerClassName: "header-x",
      titleClassName: "title-x",
    });

    expect(slot("sheet-content")?.className).toContain("popup-x");
    expect(slot("sheet-header")?.className).toContain("header-x");
    expect(slot("sheet-title")?.className).toContain("title-x");
    expect(slot("sheet-description")?.className).toContain("description-x");
    expect(slot("sheet-body")?.className).toContain("body-x");
    expect(slot("sheet-footer")?.className).toContain("footer-x");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
  });

  it("omits absent optional slots while preserving valid falsy nodes", () => {
    const view = renderSheet({ defaultOpen: true });

    expect(slot("sheet-description")).toBeNull();
    expect(slot("sheet-footer")).toBeNull();

    view.unmount();
    render(
      <Sheet content={0} defaultOpen description="" footer={0} title={0} />
    );

    expect(slot("sheet-title")?.textContent).toBe("0");
    expect(slot("sheet-description")).not.toBeNull();
    expect(slot("sheet-body")?.textContent).toBe("0");
    expect(slot("sheet-footer")?.textContent).toBe("0");
  });

  it("treats null, undefined, and boolean optional slots as absent", () => {
    renderSheet({
      defaultOpen: true,
      description: false,
      footer: true,
    });

    expect(slot("sheet-description")).toBeNull();
    expect(slot("sheet-footer")).toBeNull();
  });

  it("keeps the body scroll-safe and does not inject footer behavior", () => {
    renderSheet({
      defaultOpen: true,
      footer: <button type="button">Custom action</button>,
    });

    const body = slot("sheet-body");
    expect(body?.className).toContain("min-h-0");
    expect(body?.className).toContain("flex-1");
    expect(body?.className).toContain("overflow-y-auto");

    fireEvent.click(screen.getByRole("button", { name: "Custom action" }));
    expect(screen.getByRole("dialog", { name: "Edit account" })).toBeTruthy();
  });
});

describe("Sheet — focus, dismissal, and popup ownership", () => {
  it("can prevent outside-pointer dismissal", async () => {
    renderSheet({ defaultOpen: true, disablePointerDismissal: true });

    const overlay = slot("sheet-overlay");
    if (!overlay) {
      throw new Error("Sheet overlay was not rendered");
    }
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Edit account" })).toBeTruthy();
    });
  });

  it("forwards initial and final focus targets to the popup", async () => {
    const finalFocusRef = createRef<HTMLButtonElement>();
    const view = render(
      <>
        <button ref={finalFocusRef} type="button">
          Return here
        </button>
        <Sheet
          content={
            <>
              <input aria-label="First field" />
              <input aria-label="Preferred field" />
            </>
          }
          finalFocus={finalFocusRef}
          initialFocus={() =>
            document.querySelector<HTMLInputElement>(
              '[aria-label="Preferred field"]'
            )
          }
          title="Edit account"
          trigger={<button type="button">Open settings</button>}
        />
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    const preferred = await screen.findByRole("textbox", {
      name: "Preferred field",
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(preferred);
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(document.activeElement).toBe(finalFocusRef.current);
    });
    view.unmount();
  });

  it("forwards safe popup DOM props and refs", () => {
    const popupRef = createRef<HTMLDivElement>();
    render(
      <Sheet
        content="Account settings"
        data-testid="account-sheet"
        defaultOpen
        id="account-sheet"
        ref={popupRef}
        style={{ width: "20rem" }}
        title="Edit account"
      />
    );

    const dialog = screen.getByTestId("account-sheet");
    expect(dialog.id).toBe("account-sheet");
    expect(dialog.style.width).toBe("20rem");
    expect(popupRef.current).toBe(dialog);
  });

  it("ignores Compose-owned popup keys when JavaScript bypasses types", () => {
    const unsafeProps = {
      "aria-label": "Overridden name",
      "data-closed": "forced",
      "data-side": "left",
      "data-slot": "overridden",
      children: <span>Injected child</span>,
      content: "Account settings",
      dangerouslySetInnerHTML: { __html: "<b>Injected HTML</b>" },
      defaultOpen: true,
      render: <section />,
      role: "alertdialog",
      title: "Edit account",
    } as unknown as Parameters<typeof Sheet>[0];

    render(<Sheet {...unsafeProps} />);

    const dialog = screen.getByRole("dialog", { name: "Edit account" });
    expect(dialog.getAttribute("data-side")).toBe("right");
    expect(dialog.getAttribute("data-slot")).toBe("sheet-content");
    expect(dialog.hasAttribute("data-closed")).toBe(false);
    expect(screen.queryByText("Injected child")).toBeNull();
    expect(screen.queryByText("Injected HTML")).toBeNull();
    expect(slot("sheet-body")?.textContent).toBe("Account settings");
  });

  it("server-renders an initially closed trigger without browser globals", () => {
    const html = renderToStaticMarkup(
      <Sheet
        content="Account settings"
        title="Edit account"
        trigger={<button type="button">Open settings</button>}
      />
    );

    expect(html).toContain("Open settings");
    expect(html).not.toContain('role="dialog"');
  });
});
