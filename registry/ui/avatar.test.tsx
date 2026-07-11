import { act, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./avatar";

class MockImage {
  complete = false;
  crossOrigin: string | null = null;
  naturalWidth = 0;
  onerror: ((event: Event) => void) | null = null;
  onload: ((event: Event) => void) | null = null;
  referrerPolicy = "";
  private source = "";

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value;
    imageRequests.push(this);
  }

  fail() {
    this.complete = true;
    this.naturalWidth = 0;
    this.onerror?.(new Event("error"));
  }

  succeed() {
    this.complete = true;
    this.naturalWidth = 32;
    this.onload?.(new Event("load"));
  }
}

let imageRequests: MockImage[] = [];

const slot = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-slot="${name}"]`) as HTMLElement | null;

beforeEach(() => {
  imageRequests = [];
  vi.stubGlobal("Image", MockImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Avatar", () => {
  it("renders the fallback-only minimum path", () => {
    const { container } = render(<Avatar fallback="AL" />);

    const root = slot(container, "avatar");
    const fallback = slot(container, "avatar-fallback");

    expect(root?.tagName).toBe("SPAN");
    expect(root?.getAttribute("data-size")).toBe("default");
    expect(fallback?.textContent).toBe("AL");
    expect(slot(container, "avatar-image")).toBeNull();
    expect(slot(container, "avatar-badge")).toBeNull();
    expect(imageRequests).toHaveLength(0);
  });

  it("forwards root props, events, accessibility, and refs to the root span", () => {
    const objectRef = createRef<HTMLSpanElement>();
    const callbackRef = vi.fn<(node: HTMLSpanElement | null) => void>();
    const onClick = vi.fn();
    const { container } = render(
      <>
        <Avatar
          aria-label="Ada Lovelace"
          className={["root-x", false]}
          data-user="ada"
          fallback="AL"
          id="ada-avatar"
          onClick={onClick}
          ref={objectRef}
          role="img"
          size="lg"
          style={{ marginTop: 4 }}
          title="Profile picture"
        />
        <Avatar fallback="GH" ref={callbackRef} />
      </>
    );

    const root = container.querySelector("#ada-avatar") as HTMLSpanElement;
    expect(root).toBe(objectRef.current);
    expect(root.tagName).toBe("SPAN");
    expect(root.className).toContain("root-x");
    expect(root.getAttribute("aria-label")).toBe("Ada Lovelace");
    expect(root.getAttribute("data-user")).toBe("ada");
    expect(root.getAttribute("data-size")).toBe("lg");
    expect(root.getAttribute("role")).toBe("img");
    expect(root.getAttribute("title")).toBe("Profile picture");
    expect(root.style.marginTop).toBe("4px");
    expect(callbackRef.mock.calls[0]?.[0]?.tagName).toBe("SPAN");

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("preserves all primitive sizes", () => {
    const { container, rerender } = render(<Avatar fallback="SM" size="sm" />);

    expect(slot(container, "avatar")?.getAttribute("data-size")).toBe("sm");

    rerender(<Avatar fallback="DF" />);
    expect(slot(container, "avatar")?.getAttribute("data-size")).toBe(
      "default"
    );

    rerender(<Avatar fallback="LG" size="lg" />);
    expect(slot(container, "avatar")?.getAttribute("data-size")).toBe("lg");
  });

  it("shows a successful image with explicit alt text", () => {
    const { container } = render(
      <Avatar alt="Portrait of Ada Lovelace" fallback="AL" src="/avatar.png" />
    );

    expect(imageRequests).toHaveLength(1);
    expect(imageRequests[0].src).toBe("/avatar.png");
    expect(slot(container, "avatar-fallback")?.textContent).toBe("AL");
    expect(slot(container, "avatar-image")).toBeNull();

    act(() => {
      imageRequests[0].succeed();
    });

    const image = slot(container, "avatar-image");
    expect(image?.tagName).toBe("IMG");
    expect(image?.getAttribute("alt")).toBe("Portrait of Ada Lovelace");
    expect(image?.getAttribute("src")).toBe("/avatar.png");
    expect(slot(container, "avatar-fallback")).toBeNull();
  });

  it("uses an empty alt value by default", () => {
    const { container } = render(
      <Avatar fallback="AL" src="/decorative-avatar.png" />
    );

    act(() => {
      imageRequests[0].succeed();
    });

    expect(slot(container, "avatar-image")?.getAttribute("alt")).toBe("");
  });

  it("keeps the fallback visible when an image fails", () => {
    const { container } = render(
      <Avatar
        alt="Broken portrait"
        badge="Status"
        fallback="AL"
        src="/missing.png"
      />
    );

    act(() => {
      imageRequests[0].fail();
    });

    const root = slot(container, "avatar");
    const fallback = slot(container, "avatar-fallback");
    const badge = slot(container, "avatar-badge");
    expect(slot(container, "avatar-image")).toBeNull();
    expect(fallback?.textContent).toBe("AL");
    expect(Array.from(root?.children ?? [])).toEqual([fallback, badge]);
  });

  it("skips image requests for undefined and empty sources", () => {
    const optionalSource: string | undefined = undefined;
    const { container, rerender } = render(
      <Avatar fallback="AL" src={optionalSource} />
    );

    expect(slot(container, "avatar-image")).toBeNull();
    expect(slot(container, "avatar-fallback")?.textContent).toBe("AL");
    expect(imageRequests).toHaveLength(0);

    rerender(<Avatar fallback="AL" src="" />);
    expect(slot(container, "avatar-image")).toBeNull();
    expect(slot(container, "avatar-fallback")?.textContent).toBe("AL");
    expect(imageRequests).toHaveLength(0);
  });

  it("restores the fallback when a loaded source becomes empty", () => {
    const { container, rerender } = render(
      <Avatar fallback="AL" src="/avatar.png" />
    );

    act(() => {
      imageRequests[0].succeed();
    });
    expect(slot(container, "avatar-image")?.tagName).toBe("IMG");
    expect(slot(container, "avatar-fallback")).toBeNull();

    rerender(<Avatar fallback="AL" src="" />);
    expect(slot(container, "avatar-image")).toBeNull();
    expect(slot(container, "avatar-fallback")?.textContent).toBe("AL");
    expect(imageRequests).toHaveLength(1);

    rerender(<Avatar fallback="AL" src={undefined} />);
    expect(slot(container, "avatar-image")).toBeNull();
    expect(slot(container, "avatar-fallback")?.textContent).toBe("AL");
    expect(imageRequests).toHaveLength(1);
  });

  it("renders caller-owned badge content after the active visual", () => {
    const { container } = render(
      <Avatar
        badge={<span className="sr-only">Online</span>}
        fallback="AL"
        src="/avatar.png"
      />
    );

    const root = slot(container, "avatar");
    const fallback = slot(container, "avatar-fallback");
    const badge = slot(container, "avatar-badge");
    expect(Array.from(root?.children ?? [])).toEqual([fallback, badge]);
    expect(badge?.textContent).toBe("Online");

    act(() => {
      imageRequests[0].succeed();
    });

    const image = slot(container, "avatar-image");
    expect(Array.from(root?.children ?? [])).toEqual([image, badge]);
  });

  it("follows React node presence rules for fallback and badge", () => {
    const { container, rerender } = render(<Avatar badge="" fallback={0} />);

    expect(slot(container, "avatar-fallback")?.textContent).toBe("0");
    expect(slot(container, "avatar-badge")?.textContent).toBe("");

    rerender(<Avatar badge={false} fallback={true} />);
    expect(slot(container, "avatar-fallback")).toBeNull();
    expect(slot(container, "avatar-badge")).toBeNull();

    rerender(<Avatar badge={null} fallback={undefined} />);
    expect(slot(container, "avatar-fallback")).toBeNull();
    expect(slot(container, "avatar-badge")).toBeNull();

    rerender(<Avatar badge={undefined} fallback={null} />);
    expect(slot(container, "avatar-fallback")).toBeNull();
    expect(slot(container, "avatar-badge")).toBeNull();
  });

  it("isolates every ClassValue override to its owned part", () => {
    const { container } = render(
      <Avatar
        badge="Status"
        badgeClassName={["badge-x", false]}
        className={["root-x", null]}
        fallback="AL"
        fallbackClassName={["fallback-x", undefined]}
        imageClassName={["image-x", false]}
        src="/avatar.png"
      />
    );

    const root = slot(container, "avatar") as HTMLElement;
    const fallback = slot(container, "avatar-fallback") as HTMLElement;
    const badge = slot(container, "avatar-badge") as HTMLElement;
    expect(root.className).toContain("root-x");
    expect(root.className).not.toContain("fallback-x");
    expect(root.className).not.toContain("badge-x");
    expect(fallback.className).toContain("fallback-x");
    expect(fallback.className).not.toContain("root-x");
    expect(fallback.className).not.toContain("badge-x");
    expect(badge.className).toContain("badge-x");
    expect(badge.className).not.toContain("root-x");
    expect(badge.className).not.toContain("fallback-x");

    act(() => {
      imageRequests[0].succeed();
    });

    const image = slot(container, "avatar-image") as HTMLElement;
    expect(image.className).toContain("image-x");
    expect(image.className).not.toContain("root-x");
    expect(image.className).not.toContain("badge-x");
  });

  it("does not leak Compose-owned props to DOM elements", () => {
    const { container } = render(
      <Avatar
        alt="Ada"
        badge="Online"
        badgeClassName="badge-x"
        fallback="AL"
        fallbackClassName="fallback-x"
        imageClassName="image-x"
        src="/avatar.png"
      />
    );

    act(() => {
      imageRequests[0].succeed();
    });

    const composeAttributes = [
      "fallback",
      "badge",
      "src",
      "alt",
      "imageclassname",
      "fallbackclassname",
      "badgeclassname",
    ];
    const elements = container.querySelectorAll("span, img");
    for (const element of elements) {
      for (const attribute of composeAttributes) {
        if (
          element.getAttribute("data-slot") === "avatar-image" &&
          (attribute === "src" || attribute === "alt")
        ) {
          continue;
        }
        expect(element.getAttribute(attribute)).toBeNull();
      }
    }
  });
});
