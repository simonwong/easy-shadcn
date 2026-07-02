import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./popover";

const renderPopover = (props: Partial<Parameters<typeof Popover>[0]> = {}) =>
  render(
    <Popover content="Popover body" {...props}>
      <button type="button">Trigger</button>
    </Popover>
  );

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`);

describe("Popover", () => {
  it("renders the child as the trigger without an extra wrapper button", () => {
    renderPopover();

    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(trigger).toBeTruthy();
    // render={children} makes the child itself the trigger — no nested button.
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(trigger.getAttribute("data-slot")).toBe("popover-trigger");
  });

  it("is closed by default", () => {
    renderPopover();

    expect(screen.queryByText("Popover body")).toBeNull();
  });

  it("shows the content when defaultOpen is set", () => {
    renderPopover({ defaultOpen: true });

    expect(screen.getByText("Popover body")).toBeTruthy();
  });

  it("shows the content in the controlled open mode", () => {
    renderPopover({ open: true });

    expect(screen.getByText("Popover body")).toBeTruthy();
  });

  it("stays closed when controlled open is false", () => {
    renderPopover({ open: false });

    expect(screen.queryByText("Popover body")).toBeNull();
  });

  it("opens on trigger click and fires onOpenChange", async () => {
    const onOpenChange = vi.fn();
    renderPopover({ onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Trigger" }));

    await waitFor(() => expect(screen.getByText("Popover body")).toBeTruthy());
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("does not open while disabled", () => {
    const onOpenChange = vi.fn();
    renderPopover({ disabled: true, onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Trigger" }));

    expect(screen.queryByText("Popover body")).toBeNull();
  });

  it("forwards className, data-* and side to the popup", () => {
    render(
      <Popover
        className="popup-cls"
        content="Popover body"
        data-testid="the-popup"
        defaultOpen
        side="top"
      >
        <button type="button">Trigger</button>
      </Popover>
    );

    const popup = document.querySelector('[data-slot="popover-content"]');
    expect(popup?.className).toContain("popup-cls");
    expect(popup?.getAttribute("data-testid")).toBe("the-popup");
    expect(
      popup?.closest("[data-side]")?.getAttribute("data-side") ??
        popup?.getAttribute("data-side")
    ).toBe("top");
  });

  describe("content slots", () => {
    it("renders title, description, body, and footer slots", () => {
      renderPopover({
        content: "Body text",
        defaultOpen: true,
        description: "The description",
        footer: "The footer",
        title: "The title",
      });

      expect(slot("popover-title")?.textContent).toBe("The title");
      expect(slot("popover-description")?.textContent).toBe("The description");
      expect(slot("popover-body")?.textContent).toBe("Body text");
      expect(slot("popover-footer")?.textContent).toBe("The footer");
    });

    it("renders the header only once when title and description coexist", () => {
      renderPopover({ defaultOpen: true, description: "d", title: "t" });

      expect(
        document.querySelectorAll('[data-slot="popover-header"]')
      ).toHaveLength(1);
    });

    it("renders the header when only the title is present", () => {
      renderPopover({ defaultOpen: true, title: "only title" });

      expect(slot("popover-header")).not.toBeNull();
      expect(slot("popover-description")).toBeNull();
    });

    it("renders the header when only the description is present", () => {
      renderPopover({ defaultOpen: true, description: "only description" });

      expect(slot("popover-header")).not.toBeNull();
      expect(slot("popover-title")).toBeNull();
    });

    it("omits the header when neither title nor description is present", () => {
      renderPopover({ content: "Body only", defaultOpen: true });

      expect(slot("popover-header")).toBeNull();
    });

    it("omits body and footer when their nodes are absent", () => {
      renderPopover({ content: undefined, defaultOpen: true, title: "t" });

      expect(slot("popover-body")).toBeNull();
      expect(slot("popover-footer")).toBeNull();
    });

    it("renders falsy but valid nodes like 0 and empty string", () => {
      renderPopover({
        content: 0,
        defaultOpen: true,
        footer: "",
        title: 0,
      });

      expect(slot("popover-title")?.textContent).toBe("0");
      expect(slot("popover-body")?.textContent).toBe("0");
      expect(slot("popover-footer")?.textContent).toBe("");
    });

    it("treats null, undefined, and boolean slot values as absent", () => {
      renderPopover({
        content: null,
        defaultOpen: true,
        description: undefined,
        footer: true,
        title: null,
      });

      expect(slot("popover-header")).toBeNull();
      expect(slot("popover-body")).toBeNull();
      expect(slot("popover-footer")).toBeNull();
    });

    it("forwards every xxxClassName to its slot", () => {
      renderPopover({
        content: "Body",
        contentClassName: "body-x",
        defaultOpen: true,
        description: "Description",
        descriptionClassName: "description-x",
        footer: "Footer",
        footerClassName: "footer-x",
        headerClassName: "header-x",
        title: "Title",
        titleClassName: "title-x",
      });

      expect(slot("popover-header")?.className).toContain("header-x");
      expect(slot("popover-title")?.className).toContain("title-x");
      expect(slot("popover-description")?.className).toContain("description-x");
      expect(slot("popover-body")?.className).toContain("body-x");
      expect(slot("popover-footer")?.className).toContain("footer-x");
    });
  });
});
