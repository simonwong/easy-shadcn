import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tooltip } from "./tooltip";

const renderTooltip = (props: Partial<Parameters<typeof Tooltip>[0]> = {}) =>
  render(
    <Tooltip content="Helpful tip" {...props}>
      <button type="button">Trigger</button>
    </Tooltip>
  );

describe("Tooltip", () => {
  it("renders the child as the trigger without an extra wrapper button", () => {
    renderTooltip();

    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(trigger).toBeTruthy();
    // render={children} makes the child itself the trigger — no nested button.
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(trigger.getAttribute("data-slot")).toBe("tooltip-trigger");
  });

  it("opens on trigger focus and fires onOpenChange", async () => {
    const onOpenChange = vi.fn();
    renderTooltip({ onOpenChange });

    fireEvent.focus(screen.getByRole("button", { name: "Trigger" }));

    await waitFor(() => expect(screen.getByText("Helpful tip")).toBeTruthy());
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("is closed by default", () => {
    renderTooltip();

    expect(screen.queryByText("Helpful tip")).toBeNull();
  });

  it("shows the content when defaultOpen is set", () => {
    renderTooltip({ defaultOpen: true });

    expect(screen.getByText("Helpful tip")).toBeTruthy();
  });

  it("shows the content in the controlled open mode", () => {
    renderTooltip({ open: true });

    expect(screen.getByText("Helpful tip")).toBeTruthy();
  });

  it("stays closed when controlled open is false", () => {
    renderTooltip({ open: false });

    expect(screen.queryByText("Helpful tip")).toBeNull();
  });

  it("forwards contentClassName and side to the popup", () => {
    renderTooltip({
      contentClassName: "tip-cls",
      defaultOpen: true,
      side: "bottom",
    });

    const popup = document.querySelector('[data-slot="tooltip-content"]');
    expect(popup?.className).toContain("tip-cls");
    expect(
      popup?.closest("[data-side]")?.getAttribute("data-side") ??
        popup?.getAttribute("data-side")
    ).toBe("bottom");
  });

  it("does not open while disabled", () => {
    renderTooltip({ defaultOpen: true, disabled: true });

    expect(screen.queryByText("Helpful tip")).toBeNull();
  });
});
