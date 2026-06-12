import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./card";

const slot = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-slot="${name}"]`);

describe("Card", () => {
  it("renders title, description, action, content, and footer slots", () => {
    const { container } = render(
      <Card
        action={<button type="button">More</button>}
        description="Card description"
        footer="Card footer"
        title="Card title"
      >
        Card body
      </Card>
    );

    expect(slot(container, "card-title")?.textContent).toBe("Card title");
    expect(slot(container, "card-description")?.textContent).toBe(
      "Card description"
    );
    expect(slot(container, "card-action")?.textContent).toBe("More");
    expect(slot(container, "card-content")?.textContent).toBe("Card body");
    expect(slot(container, "card-footer")?.textContent).toBe("Card footer");
  });

  it("does not render an empty header without title, description, or action", () => {
    const { container } = render(<Card>Body only</Card>);

    expect(slot(container, "card-header")).toBeNull();
    expect(slot(container, "card-content")?.textContent).toBe("Body only");
  });

  it("does not render content or footer when they are absent", () => {
    const { container } = render(<Card title="Header only" />);

    expect(slot(container, "card-header")).not.toBeNull();
    expect(slot(container, "card-content")).toBeNull();
    expect(slot(container, "card-footer")).toBeNull();
  });

  it("renders falsy but valid nodes like 0", () => {
    const { container } = render(<Card title={0}>{0}</Card>);

    expect(slot(container, "card-title")?.textContent).toBe("0");
    expect(slot(container, "card-content")?.textContent).toBe("0");
  });

  it("treats boolean and null slot values as absent", () => {
    const { container } = render(
      <Card footer={false} title={null}>
        {true}
      </Card>
    );

    expect(slot(container, "card-header")).toBeNull();
    expect(slot(container, "card-content")).toBeNull();
    expect(slot(container, "card-footer")).toBeNull();
  });

  it("applies dividers to header and footer when dividers is true", () => {
    const { container } = render(
      <Card dividers footer="Footer" title="Title">
        Body
      </Card>
    );

    expect(slot(container, "card-header")?.classList).toContain("border-b");
    expect(slot(container, "card-footer")?.classList).not.toContain(
      "border-none"
    );
  });

  it("hides the footer divider by default", () => {
    const { container } = render(
      <Card footer="Footer" title="Title">
        Body
      </Card>
    );

    expect(slot(container, "card-header")?.classList).not.toContain("border-b");
    expect(slot(container, "card-footer")?.classList).toContain("border-none");
    expect(slot(container, "card-footer")?.classList).toContain(
      "bg-transparent"
    );
  });

  it("supports the object form of dividers", () => {
    const { container } = render(
      <Card dividers={{ footer: true }} footer="Footer" title="Title">
        Body
      </Card>
    );

    expect(slot(container, "card-header")?.classList).not.toContain("border-b");
    expect(slot(container, "card-footer")?.classList).not.toContain(
      "border-none"
    );
  });

  it("forwards every xxxClassName to its slot", () => {
    const { container } = render(
      <Card
        action={<button type="button">More</button>}
        actionClassName="action-x"
        className="root-x"
        contentClassName="content-x"
        description="Description"
        descriptionClassName="description-x"
        footer="Footer"
        footerClassName="footer-x"
        headerClassName="header-x"
        title="Title"
        titleClassName="title-x"
      >
        Body
      </Card>
    );

    expect(slot(container, "card")?.className).toContain("root-x");
    expect(slot(container, "card-header")?.className).toContain("header-x");
    expect(slot(container, "card-title")?.className).toContain("title-x");
    expect(slot(container, "card-description")?.className).toContain(
      "description-x"
    );
    expect(slot(container, "card-action")?.className).toContain("action-x");
    expect(slot(container, "card-content")?.className).toContain("content-x");
    expect(slot(container, "card-footer")?.className).toContain("footer-x");
  });

  it("forwards size and native div props", () => {
    const { container } = render(
      <Card data-testid="stat-card" size="sm" title="Title">
        Body
      </Card>
    );

    expect(slot(container, "card")?.getAttribute("data-size")).toBe("sm");
    expect(screen.getByTestId("stat-card")).toBe(slot(container, "card"));
  });
});
