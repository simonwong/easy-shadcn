import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type useEmblaCarousel from "embla-carousel-react";
import { createRef } from "react";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, type CarouselOptions, type CarouselProps } from "./carousel";

type InitializedCarouselApi = NonNullable<CarouselApi>;
type EmblaEvent = Parameters<InitializedCarouselApi["on"]>[0];
type EmblaListener = Parameters<InitializedCarouselApi["on"]>[1];
type UseEmblaCarousel = (
  ...args: Parameters<typeof useEmblaCarousel>
) => ReturnType<typeof useEmblaCarousel>;

const emblaHarness = vi.hoisted(() => {
  let selectedIndex = 0;
  let slideCount = 3;
  const listeners = new Map<EmblaEvent, Set<EmblaListener>>();
  const carouselRef = vi.fn<ReturnType<UseEmblaCarousel>[0]>();
  let api: InitializedCarouselApi;

  const emitListeners = (eventName: EmblaEvent) => {
    for (const listener of listeners.get(eventName) ?? []) {
      listener(api, eventName);
    }
  };

  let eventHandler: ReturnType<InitializedCarouselApi["on"]>;
  const off = vi.fn((eventName: EmblaEvent, listener: EmblaListener) => {
    listeners.get(eventName)?.delete(listener);
    return eventHandler;
  });
  const on = vi.fn((eventName: EmblaEvent, listener: EmblaListener) => {
    const eventListeners = listeners.get(eventName) ?? new Set();
    eventListeners.add(listener);
    listeners.set(eventName, eventListeners);
    return eventHandler;
  });
  eventHandler = {
    clear: vi.fn(),
    emit: vi.fn((eventName: EmblaEvent) => {
      emitListeners(eventName);
      return eventHandler;
    }),
    init: vi.fn(),
    off,
    on,
  };

  const apiBoundary = {
    canScrollNext: vi.fn(() => selectedIndex < slideCount - 1),
    canScrollPrev: vi.fn(() => selectedIndex > 0),
    off,
    on,
    scrollNext: vi.fn(() => {
      selectedIndex = Math.min(selectedIndex + 1, slideCount - 1);
      emitListeners("select");
    }),
    scrollPrev: vi.fn(() => {
      selectedIndex = Math.max(selectedIndex - 1, 0);
      emitListeners("select");
    }),
    selectedScrollSnap: vi.fn(() => selectedIndex),
  } satisfies Pick<
    InitializedCarouselApi,
    | "canScrollNext"
    | "canScrollPrev"
    | "off"
    | "on"
    | "scrollNext"
    | "scrollPrev"
    | "selectedScrollSnap"
  >;
  api = apiBoundary as unknown as InitializedCarouselApi;

  const useEmblaCarousel = vi.fn<UseEmblaCarousel>(() => [carouselRef, api]);

  return {
    api,
    reset: () => {
      selectedIndex = 0;
      slideCount = 3;
      listeners.clear();
    },
    setSlideCount: (count: number) => {
      slideCount = count;
    },
    useEmblaCarousel,
  };
});

vi.mock("embla-carousel-react", () => ({
  default: emblaHarness.useEmblaCarousel,
}));

beforeEach(() => {
  vi.clearAllMocks();
  emblaHarness.reset();
});

const items = [
  { item: "Alpha", value: "alpha" },
  { item: "Beta", value: "beta" },
  { item: "Gamma", value: "gamma" },
];

describe("Carousel", () => {
  it("renders nothing and does not initialize Embla for an empty list", () => {
    const { container } = render(
      <Carousel aria-label="Empty gallery" items={[]} />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    expect(emblaHarness.useEmblaCarousel).not.toHaveBeenCalled();
  });

  it("labels a single slide and omits permanently disabled controls", () => {
    emblaHarness.setSlideCount(1);
    render(
      <Carousel
        aria-label="Single project"
        items={[{ item: "Only project", value: "only" }]}
      />
    );

    const root = screen.getByRole("region", { name: "Single project" });
    const slide = within(root).getByRole("group", { name: "1 of 1" });

    expect(slide).toHaveAttribute("aria-roledescription", "slide");
    expect(slide).toHaveTextContent("Only project");
    expect(within(root).queryByRole("button")).toBeNull();
  });

  it("renders a caller-named primitive structure in input order", () => {
    render(
      <>
        <h2 id="featured-projects-heading">Featured projects</h2>
        <Carousel aria-labelledby="featured-projects-heading" items={items} />
      </>
    );

    const root = screen.getByRole("region", { name: "Featured projects" });
    const slides = within(root).getAllByRole("group");

    expect(root).toHaveAttribute("aria-roledescription", "carousel");
    expect(root).toHaveAttribute("data-slot", "carousel");
    expect(root.querySelector('[data-slot="carousel-content"]')).not.toBeNull();
    expect(slides.map((slide) => slide.textContent)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
    ]);
    expect(slides.map((slide) => slide.getAttribute("aria-label"))).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
    expect(root.innerHTML).not.toContain("alpha");
  });

  it("keeps zero and empty-string slide content valid", () => {
    render(
      <Carousel
        aria-label="Falsy content"
        items={[
          { item: 0, value: "zero" },
          { item: "", value: "empty" },
        ]}
      />
    );

    const slides = within(
      screen.getByRole("region", { name: "Falsy content" })
    ).getAllByRole("group");
    expect(slides).toHaveLength(2);
    expect(slides[0]).toHaveTextContent("0");
    expect(slides[1]).toBeEmptyDOMElement();
  });

  it("lets Embla own control boundaries and scroll actions", () => {
    render(<Carousel aria-label="Projects" items={items} />);

    const root = screen.getByRole("region", { name: "Projects" });
    const previous = within(root).getByRole("button", {
      name: "Previous slide",
    });
    const next = within(root).getByRole("button", { name: "Next slide" });

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    fireEvent.click(next);
    expect(emblaHarness.api.scrollNext).toHaveBeenCalledTimes(1);
    expect(emblaHarness.api.selectedScrollSnap()).toBe(1);
    expect(previous).toBeEnabled();
    expect(next).toBeEnabled();

    fireEvent.click(next);
    expect(emblaHarness.api.selectedScrollSnap()).toBe(2);
    expect(next).toBeDisabled();

    fireEvent.click(previous);
    expect(emblaHarness.api.scrollPrev).toHaveBeenCalledTimes(1);
    expect(emblaHarness.api.selectedScrollSnap()).toBe(1);
    expect(next).toBeEnabled();
  });

  it("delegates horizontal ArrowLeft and ArrowRight handling to the primitive", () => {
    render(<Carousel aria-label="Projects" items={items} />);
    const root = screen.getByRole("region", { name: "Projects" });

    expect(fireEvent.keyDown(root, { key: "ArrowRight" })).toBe(false);
    expect(emblaHarness.api.scrollNext).toHaveBeenCalledTimes(1);

    expect(fireEvent.keyDown(root, { key: "ArrowLeft" })).toBe(false);
    expect(emblaHarness.api.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it("delegates plugins and exposes the initialized API", () => {
    const plugin = {
      destroy: vi.fn(),
      init: vi.fn(),
      name: "test-plugin",
      options: {},
    };
    const setApi = vi.fn();

    render(
      <Carousel
        aria-label="Projects"
        items={items}
        plugins={[plugin]}
        setApi={setApi}
      />
    );

    expect(emblaHarness.useEmblaCarousel.mock.calls[0]?.[1]).toEqual([plugin]);
    expect(setApi).toHaveBeenCalledWith(emblaHarness.api);
  });

  it("makes orientation the only axis owner and sanitizes breakpoint axes", () => {
    const options = {
      align: "start",
      axis: "y",
      breakpoints: {
        "(min-width: 48rem)": {
          align: "center",
          axis: "y",
          breakpoints: { nested: { axis: "y" } },
        },
      },
      direction: "rtl",
    } as unknown as CarouselOptions;

    render(
      <Carousel
        aria-label="Projects"
        dir="rtl"
        items={items}
        opts={options}
        orientation="horizontal"
      />
    );

    const passedOptions = emblaHarness.useEmblaCarousel.mock.calls[0]?.[0] as {
      axis?: string;
      breakpoints?: Record<string, Record<string, unknown>>;
      direction?: string;
    };
    expect(passedOptions.axis).toBe("x");
    expect(passedOptions.direction).toBe("rtl");
    expect(passedOptions.breakpoints?.["(min-width: 48rem)"]).toEqual({
      align: "center",
    });
    expect((options as unknown as { axis: string }).axis).toBe("y");
    expect(options.breakpoints?.["(min-width: 48rem)"]).toMatchObject({
      axis: "y",
    });
  });

  it("preserves safe Embla options when no breakpoints are present", () => {
    render(
      <Carousel
        aria-label="Looping projects"
        items={items}
        opts={{ align: "start", loop: true }}
      />
    );

    expect(emblaHarness.useEmblaCarousel.mock.calls[0]?.[0]).toMatchObject({
      align: "start",
      axis: "x",
      loop: true,
    });
  });

  it("maps vertical orientation to y without adding Compose RTL rotation", () => {
    render(
      <Carousel
        aria-label="Vertical projects"
        dir="rtl"
        items={items}
        orientation="vertical"
      />
    );

    const root = screen.getByRole("region", { name: "Vertical projects" });
    const controls = within(root).getAllByRole("button");
    const passedOptions = emblaHarness.useEmblaCarousel.mock.calls[0]?.[0] as {
      axis?: string;
    };

    expect(passedOptions.axis).toBe("y");
    expect(controls[0]?.className).not.toContain("rtl:rotate-180");
    expect(controls[1]?.className).not.toContain("rtl:rotate-180");
  });

  it("merges each supported class surface at its owned slot", () => {
    render(
      <Carousel
        aria-label="Styled projects"
        className="root-class"
        contentClassName="track-class"
        itemClassName="global-item-class basis-1/2"
        items={[
          {
            item: "Alpha",
            itemClassName: "local-item-class basis-1/3",
            value: "a",
          },
          { item: "Beta", value: "b" },
        ]}
        nextClassName="next-class"
        previousClassName="previous-class"
      />
    );

    const root = screen.getByRole("region", { name: "Styled projects" });
    const viewport = root.querySelector('[data-slot="carousel-content"]');
    const track = viewport?.firstElementChild;
    const slides = within(root).getAllByRole("group");

    expect(root).toHaveClass("root-class");
    expect(viewport).not.toHaveClass("track-class");
    expect(track).toHaveClass("track-class");
    expect(slides[0]).toHaveClass(
      "global-item-class",
      "local-item-class",
      "basis-1/3"
    );
    expect(slides[0]).not.toHaveClass("basis-1/2");
    expect(slides[1]).toHaveClass("global-item-class", "basis-1/2");
    expect(
      within(root).getByRole("button", { name: "Previous slide" })
    ).toHaveClass("previous-class", "rtl:rotate-180");
    expect(
      within(root).getByRole("button", { name: "Next slide" })
    ).toHaveClass("next-class", "rtl:rotate-180");
  });

  it("keeps root ownership while forwarding safe div props and the outer ref", () => {
    const ref = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    const stolenKeyHandler = vi.fn();
    const unsafeProps = {
      "aria-label": "Owned root",
      "aria-roledescription": "stolen",
      children: "stolen children",
      "data-safe": "kept",
      "data-slot": "stolen-slot",
      dangerouslySetInnerHTML: { __html: "stolen html" },
      defaultValue: "stolen-default",
      dir: "rtl" as const,
      id: "owned-root",
      items,
      onClick,
      onKeyDownCapture: stolenKeyHandler,
      onSelect: vi.fn(),
      onValueChange: vi.fn(),
      ref,
      role: "main",
      style: { color: "rgb(1, 2, 3)" },
      value: "stolen-value",
    } as unknown as CarouselProps;

    render(<Carousel {...unsafeProps} />);

    const root = screen.getByRole("region", { name: "Owned root" });
    expect(root).toBe(ref.current);
    expect(root).toHaveAttribute("id", "owned-root");
    expect(root).toHaveAttribute("data-safe", "kept");
    expect(root).toHaveAttribute("data-slot", "carousel");
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
    expect(root).toHaveAttribute("dir", "rtl");
    expect(root).toHaveStyle({ color: "rgb(1, 2, 3)" });
    expect(root).not.toHaveTextContent("stolen children");
    expect(root).not.toHaveTextContent("stolen html");
    expect(root).not.toHaveAttribute("value");

    fireEvent.click(root);
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(stolenKeyHandler).not.toHaveBeenCalled();
    expect(emblaHarness.api.scrollNext).toHaveBeenCalledTimes(1);
  });

  it("reads only approved item keys", () => {
    const unsafeItems = [
      {
        "aria-label": "stolen slide name",
        "data-unsafe": "stolen",
        id: "stolen-id",
        item: "Alpha",
        value: "alpha",
      },
      { item: "Beta", value: "beta" },
    ];

    render(
      <Carousel
        aria-label="Safe items"
        items={unsafeItems as CarouselProps["items"]}
      />
    );

    const firstSlide = within(
      screen.getByRole("region", { name: "Safe items" })
    ).getByRole("group", { name: "1 of 2" });
    expect(firstSlide).not.toHaveAttribute("id");
    expect(firstSlide).not.toHaveAttribute("data-unsafe");
  });

  it("renders deterministic server markup without invoking setApi", () => {
    const setApi = vi.fn();
    const props = {
      "aria-label": "Server projects",
      items: items.slice(0, 2),
      setApi,
    } as const;

    const firstMarkup = renderToStaticMarkup(<Carousel {...props} />);
    const secondMarkup = renderToStaticMarkup(<Carousel {...props} />);

    expect(firstMarkup).toBe(secondMarkup);
    expect(firstMarkup).toContain('aria-label="1 of 2"');
    expect(firstMarkup).toContain('aria-label="2 of 2"');
    expect(setApi).not.toHaveBeenCalled();
  });
});
