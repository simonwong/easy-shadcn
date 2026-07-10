import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./alert";

describe("Alert", () => {
  it("renders flat title and description with alert semantics", () => {
    render(<Alert description="Changes saved." title="Success" />);

    const root = screen.getByRole("alert");
    expect(root.querySelector('[data-slot="alert-title"]')?.textContent).toBe(
      "Success"
    );
    expect(
      root.querySelector('[data-slot="alert-description"]')?.textContent
    ).toBe("Changes saved.");
    expect(root.getAttribute("title")).toBeNull();
  });

  it("follows React node presence rules for content parts", () => {
    const { container, rerender } = render(<Alert description="" title={0} />);

    expect(
      container.querySelector('[data-slot="alert-title"]')?.textContent
    ).toBe("0");
    expect(
      container.querySelector('[data-slot="alert-description"]')?.textContent
    ).toBe("");

    rerender(<Alert description={true} title={null} />);

    expect(container.querySelector('[data-slot="alert-title"]')).toBeNull();
    expect(
      container.querySelector('[data-slot="alert-description"]')
    ).toBeNull();
  });

  it("renders only the provided content parts and permits an empty root", () => {
    const { container, rerender } = render(<Alert title="Title only" />);

    expect(container.querySelector('[data-slot="alert-title"]')).not.toBeNull();
    expect(
      container.querySelector('[data-slot="alert-description"]')
    ).toBeNull();

    rerender(<Alert description="Description only" />);
    expect(container.querySelector('[data-slot="alert-title"]')).toBeNull();
    expect(
      container.querySelector('[data-slot="alert-description"]')
    ).not.toBeNull();

    rerender(<Alert />);
    expect(screen.getByRole("alert").childElementCount).toBe(0);
  });

  it("forwards safe primitive root props", () => {
    const onClick = vi.fn();
    render(
      <Alert
        aria-label="Deployment status"
        className="root-x"
        data-state="ready"
        id="deployment-alert"
        onClick={onClick}
        style={{ marginTop: 4 }}
        title="Deployed"
      />
    );

    const root = screen.getByRole("alert", { name: "Deployment status" });
    expect(root.id).toBe("deployment-alert");
    expect(root.className).toContain("root-x");
    expect(root.getAttribute("data-state")).toBe("ready");
    expect(root.style.marginTop).toBe("4px");

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a caller-styled icon as the first direct child", () => {
    render(
      <Alert
        icon={
          <svg aria-label="Status icon" className="icon-x" data-testid="icon" />
        }
        title="Heads up"
      />
    );

    const root = screen.getByRole("alert");
    const icon = screen.getByTestId("icon");
    expect(icon.parentElement).toBe(root);
    expect(root.firstElementChild).toBe(icon);
    expect(icon.getAttribute("class")).toContain("icon-x");
  });

  it("does not invent a default icon or icon wrapper", () => {
    render(<Alert title="No icon requested" />);

    const root = screen.getByRole("alert");
    expect(root.querySelector("svg")).toBeNull();
    expect(root.firstElementChild?.getAttribute("data-slot")).toBe(
      "alert-title"
    );
  });

  it("preserves the primitive default and destructive variants", () => {
    const { rerender } = render(<Alert title="Status" />);

    expect(screen.getByRole("alert").className).toContain(
      "text-card-foreground"
    );

    rerender(<Alert title="Failed" variant="destructive" />);
    expect(screen.getByRole("alert").className).toContain("text-destructive");
  });

  it("renders a caller-owned action without intercepting its behavior", () => {
    const onUndo = vi.fn();
    render(
      <Alert
        action={
          <button onClick={onUndo} type="button">
            Undo
          </button>
        }
        title="Messages archived"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getByRole("button", { name: "Undo" })
        .closest('[data-slot="alert-action"]')
    ).not.toBeNull();
  });

  it("supports action-only alerts and omits absent actions", () => {
    const { container, rerender } = render(<Alert action={0} />);

    expect(
      container.querySelector('[data-slot="alert-action"]')?.textContent
    ).toBe("0");
    expect(container.querySelector('[data-slot="alert-title"]')).toBeNull();
    expect(
      container.querySelector('[data-slot="alert-description"]')
    ).toBeNull();

    rerender(<Alert action={false} />);
    expect(container.querySelector('[data-slot="alert-action"]')).toBeNull();
  });

  it("keeps icon, title, description, and action in primitive order", () => {
    render(
      <Alert
        action="Action"
        description="Description"
        icon={<svg data-slot="test-icon" />}
        title="Title"
      />
    );

    expect(
      Array.from(screen.getByRole("alert").children, (child) =>
        child.getAttribute("data-slot")
      )
    ).toEqual([
      "test-icon",
      "alert-title",
      "alert-description",
      "alert-action",
    ]);
  });

  it("applies ClassValue overrides to each wrapped content part", () => {
    const { container } = render(
      <Alert
        action="Action"
        actionClassName={["action-x", false]}
        description="Description"
        descriptionClassName={["description-x", null]}
        title="Title"
        titleClassName={["title-x", undefined]}
      />
    );

    expect(
      container.querySelector('[data-slot="alert-title"]')?.className
    ).toContain("title-x");
    expect(
      container.querySelector('[data-slot="alert-description"]')?.className
    ).toContain("description-x");
    expect(
      container.querySelector('[data-slot="alert-action"]')?.className
    ).toContain("action-x");
  });
});
