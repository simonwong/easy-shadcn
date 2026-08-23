import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Empty, type EmptyProps } from "./empty";

const slot = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLElement>(`[data-slot="${name}"]`);

describe("Empty", () => {
  it("renders one empty root without empty wrappers", () => {
    const { container } = render(<Empty />);
    const root = slot(container, "empty");

    expect(root).toBeTruthy();
    expect(root?.children).toHaveLength(0);
    expect(slot(container, "empty-header")).toBeNull();
    expect(slot(container, "empty-content")).toBeNull();
  });

  it("renders the fixed primitive hierarchy in order", () => {
    const { container } = render(
      <Empty
        content="Create project"
        description="Start with your first project."
        media="Folder"
        title="No projects"
      />
    );
    const root = slot(container, "empty");
    const header = slot(container, "empty-header");

    expect(
      Array.from(root?.children ?? []).map((node) =>
        node.getAttribute("data-slot")
      )
    ).toEqual(["empty-header", "empty-content"]);
    expect(
      Array.from(header?.children ?? []).map((node) =>
        node.getAttribute("data-slot")
      )
    ).toEqual(["empty-icon", "empty-title", "empty-description"]);
    expect(slot(container, "empty-icon")?.textContent).toBe("Folder");
    expect(slot(container, "empty-title")?.textContent).toBe("No projects");
    expect(slot(container, "empty-description")?.textContent).toBe(
      "Start with your first project."
    );
    expect(slot(container, "empty-content")?.textContent).toBe(
      "Create project"
    );
  });

  it("renders content without an empty header", () => {
    const { container } = render(<Empty content="Create project" />);

    expect(slot(container, "empty-header")).toBeNull();
    expect(slot(container, "empty-content")?.textContent).toBe(
      "Create project"
    );
  });

  it("renders one header for a description alone and keeps its content current", () => {
    const view = render(<Empty description="No projects yet." />);

    expect(
      view.container.querySelectorAll('[data-slot="empty-header"]')
    ).toHaveLength(1);
    expect(slot(view.container, "empty-icon")).toBeNull();
    expect(slot(view.container, "empty-title")).toBeNull();
    expect(slot(view.container, "empty-content")).toBeNull();
    expect(slot(view.container, "empty-description")?.textContent).toBe(
      "No projects yet."
    );

    view.rerender(<Empty description="Still no projects." />);
    expect(
      view.container.querySelectorAll('[data-slot="empty-header"]')
    ).toHaveLength(1);
    expect(slot(view.container, "empty-description")?.textContent).toBe(
      "Still no projects."
    );
  });

  it.each([
    0,
    "",
  ])("preserves the valid falsy node %j in every slot", (value) => {
    const { container } = render(
      <Empty content={value} description={value} media={value} title={value} />
    );

    expect(slot(container, "empty-header")).toBeTruthy();
    expect(slot(container, "empty-icon")).toBeTruthy();
    expect(slot(container, "empty-title")).toBeTruthy();
    expect(slot(container, "empty-description")).toBeTruthy();
    expect(slot(container, "empty-content")).toBeTruthy();
  });

  it.each([
    null,
    undefined,
    true,
    false,
  ])("treats %j as absent in every slot", (value) => {
    const { container } = render(
      <Empty content={value} description={value} media={value} title={value} />
    );

    expect(slot(container, "empty-header")).toBeNull();
    expect(slot(container, "empty-icon")).toBeNull();
    expect(slot(container, "empty-title")).toBeNull();
    expect(slot(container, "empty-description")).toBeNull();
    expect(slot(container, "empty-content")).toBeNull();
  });

  it("removes stale wrappers and preserves order across rerenders", () => {
    const view = render(<Empty />);

    view.rerender(<Empty content="Only content" />);
    expect(slot(view.container, "empty-header")).toBeNull();
    expect(slot(view.container, "empty-content")?.textContent).toBe(
      "Only content"
    );

    view.rerender(<Empty title="Only title" />);
    expect(slot(view.container, "empty-header")).toBeTruthy();
    expect(slot(view.container, "empty-title")?.textContent).toBe("Only title");
    expect(slot(view.container, "empty-content")).toBeNull();

    view.rerender(
      <Empty
        content="Latest content"
        description="Latest description"
        media="Latest media"
        title="Latest title"
      />
    );
    const root = slot(view.container, "empty");
    const header = slot(view.container, "empty-header");
    expect(
      Array.from(root?.children ?? []).map((node) =>
        node.getAttribute("data-slot")
      )
    ).toEqual(["empty-header", "empty-content"]);
    expect(
      Array.from(header?.children ?? []).map((node) => node.textContent)
    ).toEqual(["Latest media", "Latest title", "Latest description"]);
  });

  it("server-renders the same fixed hierarchy", () => {
    const html = renderToStaticMarkup(
      <Empty
        content="Create project"
        description="Start with your first project."
        media="Folder"
        title="No projects"
      />
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    const root = slot(host, "empty");
    const header = slot(host, "empty-header");

    expect(
      Array.from(root?.children ?? []).map((node) =>
        node.getAttribute("data-slot")
      )
    ).toEqual(["empty-header", "empty-content"]);
    expect(
      Array.from(header?.children ?? []).map((node) =>
        node.getAttribute("data-slot")
      )
    ).toEqual(["empty-icon", "empty-title", "empty-description"]);
  });

  it("preserves the official media default and forwards the icon variant", () => {
    const view = render(<Empty media="Avatar" />);
    const defaultMedia = slot(view.container, "empty-icon");

    expect(defaultMedia?.getAttribute("data-variant")).toBe("default");
    expect(defaultMedia?.classList).toContain("bg-transparent");

    view.rerender(<Empty media="Folder" mediaVariant="icon" />);
    const iconMedia = slot(view.container, "empty-icon");
    expect(iconMedia?.getAttribute("data-variant")).toBe("icon");
    expect(iconMedia?.classList).toContain("bg-muted");
    expect(iconMedia?.classList).not.toContain("bg-transparent");
  });

  it("keeps a media variant inert without media", () => {
    const { container } = render(<Empty mediaVariant="icon" />);

    expect(slot(container, "empty-header")).toBeNull();
    expect(slot(container, "empty-icon")).toBeNull();
  });

  it("isolates ClassValue overrides and resolves primitive conflicts", () => {
    const { container } = render(
      <Empty
        className={["root-x", "p-2"]}
        content="Create"
        contentClassName={["content-x", "gap-8"]}
        description="Description"
        descriptionClassName={["description-x", "text-red-500"]}
        headerClassName={["header-x", "gap-6"]}
        media="Folder"
        mediaClassName={["media-x", "mb-5"]}
        title="Title"
        titleClassName={["title-x", "text-lg"]}
      />
    );
    const root = slot(container, "empty");
    const header = slot(container, "empty-header");
    const media = slot(container, "empty-icon");
    const title = slot(container, "empty-title");
    const description = slot(container, "empty-description");
    const content = slot(container, "empty-content");

    expect(root?.classList).toContain("root-x");
    expect(root?.classList).toContain("p-2");
    expect(root?.classList).not.toContain("p-6");
    expect(header?.classList).toContain("header-x");
    expect(header?.classList).toContain("gap-6");
    expect(header?.classList).not.toContain("gap-2");
    expect(media?.classList).toContain("media-x");
    expect(media?.classList).toContain("mb-5");
    expect(media?.classList).not.toContain("mb-2");
    expect(title?.classList).toContain("title-x");
    expect(title?.classList).toContain("text-lg");
    expect(title?.classList).not.toContain("text-sm");
    expect(description?.classList).toContain("description-x");
    expect(description?.classList).toContain("text-red-500");
    expect(description?.classList).not.toContain("text-muted-foreground");
    expect(content?.classList).toContain("content-x");
    expect(content?.classList).toContain("gap-8");
    expect(content?.classList).not.toContain("gap-2.5");

    for (const target of [header, media, title, description, content]) {
      expect(target?.classList).not.toContain("root-x");
    }
    expect(root?.classList).not.toContain("header-x");
    expect(header?.classList).not.toContain("media-x");
    expect(media?.classList).not.toContain("title-x");
    expect(title?.classList).not.toContain("description-x");
    expect(description?.classList).not.toContain("content-x");
  });

  it("does not create wrappers from class names alone", () => {
    const { container } = render(
      <Empty
        contentClassName="content-x"
        descriptionClassName="description-x"
        headerClassName="header-x"
        mediaClassName="media-x"
        titleClassName="title-x"
      />
    );

    expect(slot(container, "empty-header")).toBeNull();
    expect(slot(container, "empty-icon")).toBeNull();
    expect(slot(container, "empty-title")).toBeNull();
    expect(slot(container, "empty-description")).toBeNull();
    expect(slot(container, "empty-content")).toBeNull();
  });

  it("uses the latest media variant and classes after rerender", () => {
    const view = render(
      <Empty
        className="root-old"
        content="Content"
        contentClassName="content-old"
        description="Description"
        descriptionClassName="description-old"
        headerClassName="header-old"
        media="Media"
        mediaClassName="media-old"
        mediaVariant="default"
        title="Title"
        titleClassName="title-old"
      />
    );

    view.rerender(
      <Empty
        className="root-latest"
        content="Content"
        contentClassName="content-latest"
        description="Description"
        descriptionClassName="description-latest"
        headerClassName="header-latest"
        media="Media"
        mediaClassName="media-latest"
        mediaVariant="icon"
        title="Title"
        titleClassName="title-latest"
      />
    );

    const targets = [
      [slot(view.container, "empty"), "root"],
      [slot(view.container, "empty-header"), "header"],
      [slot(view.container, "empty-icon"), "media"],
      [slot(view.container, "empty-title"), "title"],
      [slot(view.container, "empty-description"), "description"],
      [slot(view.container, "empty-content"), "content"],
    ] as const;
    for (const [target, name] of targets) {
      expect(target?.classList).toContain(`${name}-latest`);
      expect(target?.classList).not.toContain(`${name}-old`);
    }
    expect(slot(view.container, "empty-icon")?.dataset.variant).toBe("icon");
  });

  it("forwards ordinary root integration props and a callback ref", () => {
    const onClick = vi.fn();
    let refCurrent: HTMLDivElement | null = null;
    render(
      <Empty
        aria-label="Project state"
        content="Create project"
        data-tracking="empty-projects"
        id="project-empty"
        onClick={onClick}
        ref={(node: HTMLDivElement | null) => {
          refCurrent = node;
        }}
        role="status"
        style={{ marginTop: 12 }}
        title="No projects"
      />
    );
    const root = screen.getByRole("status", { name: "Project state" });

    expect(root.id).toBe("project-empty");
    expect(root.getAttribute("data-tracking")).toBe("empty-projects");
    expect(root.style.marginTop).toBe("12px");
    expect(refCurrent).toBe(root);
    expect(root.getAttribute("title")).toBeNull();
    expect(slot(root, "empty-title")?.textContent).toBe("No projects");

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards editable-root behavior without treating it as child injection", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { container } = render(
      <Empty
        contentEditable
        suppressContentEditableWarning
        title="Editable empty state"
      />
    );
    const root = slot(container, "empty");

    expect(root?.getAttribute("contenteditable")).toBe("true");
    expect(slot(container, "empty-title")?.textContent).toBe(
      "Editable empty state"
    );
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("strips untyped structural ownership keys at runtime", () => {
    const unsafeProps = {
      children: <span data-testid="bypass-child">Bypass child</span>,
      dangerouslySetInnerHTML: {
        __html: '<span data-testid="bypass-html">Bypass HTML</span>',
      },
      "data-slot": "bypass-empty",
    } as unknown as EmptyProps;

    const { container } = render(
      <Empty {...unsafeProps} content="Owned content" title="Owned title" />
    );
    const root = slot(container, "empty");

    expect(root).toBeTruthy();
    expect(root?.getAttribute("data-slot")).toBe("empty");
    expect(screen.queryByTestId("bypass-child")).toBeNull();
    expect(screen.queryByTestId("bypass-html")).toBeNull();
    expect(slot(container, "empty-title")?.textContent).toBe("Owned title");
    expect(slot(container, "empty-content")?.textContent).toBe("Owned content");
  });

  it("uses the latest root props, handler, editable state, and ref", () => {
    const staleHandler = vi.fn();
    const latestHandler = vi.fn();
    const staleRef = createRef<HTMLDivElement>();
    const latestRef = createRef<HTMLDivElement>();
    const view = render(
      <Empty
        contentEditable
        data-version="old"
        id="empty-old"
        onClick={staleHandler}
        ref={staleRef}
        suppressContentEditableWarning
        title="Old title"
      />
    );
    const oldRoot = slot(view.container, "empty");
    expect(staleRef.current).toBe(oldRoot);

    view.rerender(
      <Empty
        contentEditable={false}
        data-version="latest"
        id="empty-latest"
        onClick={latestHandler}
        ref={latestRef}
        suppressContentEditableWarning
        title="Latest title"
      />
    );
    const latestRoot = slot(view.container, "empty");

    expect(latestRoot).toBe(oldRoot);
    expect(latestRoot?.id).toBe("empty-latest");
    expect(latestRoot?.getAttribute("data-version")).toBe("latest");
    expect(latestRoot?.getAttribute("contenteditable")).toBe("false");
    expect(slot(view.container, "empty-title")?.textContent).toBe(
      "Latest title"
    );
    expect(staleRef.current).toBeNull();
    expect(latestRef.current).toBe(latestRoot);

    fireEvent.click(latestRoot as HTMLElement);
    expect(latestHandler).toHaveBeenCalledTimes(1);
    expect(staleHandler).not.toHaveBeenCalled();
  });
});
