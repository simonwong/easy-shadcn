import { createRef } from "react";
import {
  Carousel,
  type CarouselApi,
  type CarouselItem,
  type CarouselOptions,
  type CarouselPlugin,
  type CarouselPlugins,
  type CarouselProps,
} from "./carousel";

declare const acceptProps: (props: CarouselProps) => undefined;
declare const acceptItem: (item: CarouselItem) => undefined;
declare const plugin: CarouselPlugin;

const options: CarouselOptions = {
  align: "start",
  breakpoints: {
    "(min-width: 48rem)": { align: "center", loop: true },
  },
  direction: "rtl",
};
const plugins: CarouselPlugins = [plugin];
const setApi = (_api: CarouselApi) => undefined;

acceptProps({
  "aria-label": "Featured projects",
  items: [{ item: "Alpha", itemClassName: ["basis-1/2", false], value: "a" }],
  opts: options,
  plugins,
  setApi,
});

acceptProps({
  "aria-labelledby": "featured-projects-heading",
  items: [{ item: 0, value: "zero" }],
  orientation: "vertical",
});

acceptProps({
  "aria-label": "Safe root",
  dir: "rtl",
  id: "safe-root",
  items: [{ item: "Alpha", value: "alpha" }],
  onClick: () => undefined,
  ref: createRef<HTMLDivElement>(),
  style: { color: "red" },
  tabIndex: 0,
});

acceptItem({ item: "Slide", value: "slide" });

// @ts-expect-error Carousel requires a caller-owned accessible name.
acceptProps({ items: [] });

acceptItem({
  // @ts-expect-error CarouselItem uses the primitive-aligned item field.
  content: "Slide",
  value: "slide",
});

// @ts-expect-error CarouselItem requires a stable value.
acceptItem({ item: "Slide" });

// @ts-expect-error Orientation owns the top-level Embla axis.
const _topLevelAxis: CarouselOptions = { axis: "y" };

const _breakpointAxis: CarouselOptions = {
  breakpoints: {
    // @ts-expect-error Responsive axes are outside the safe options surface.
    "(min-width: 48rem)": { axis: "y" },
  },
};

// @ts-expect-error Compose owns all generated children.
acceptProps({ "aria-label": "Projects", children: "stolen", items: [] });

// @ts-expect-error Compose owns the root landmark role.
acceptProps({ "aria-label": "Projects", items: [], role: "main" });

acceptProps({
  "aria-label": "Projects",
  // @ts-expect-error Compose owns raw descendant structure.
  dangerouslySetInnerHTML: { __html: "stolen" },
  items: [],
});

// @ts-expect-error Compose owns the primitive slot marker.
acceptProps({ "aria-label": "Projects", "data-slot": "stolen", items: [] });

acceptProps({
  "aria-label": "Projects",
  // @ts-expect-error Compose owns the carousel role description.
  "aria-roledescription": "stolen",
  items: [],
});

acceptProps({
  "aria-label": "Projects",
  items: [],
  // @ts-expect-error Compose owns primitive keyboard navigation.
  onKeyDownCapture: () => undefined,
});

// @ts-expect-error Selection defaults are outside the flat Carousel API.
acceptProps({ "aria-label": "Projects", defaultValue: "beta", items: [] });

// @ts-expect-error Controlled selection values are outside the flat Carousel API.
acceptProps({ "aria-label": "Projects", items: [], value: "beta" });

// @ts-expect-error Selection callbacks are outside the flat Carousel API.
acceptProps({ "aria-label": "Projects", items: [], onSelect: () => undefined });

acceptProps({
  "aria-label": "Projects",
  items: [],
  // @ts-expect-error Compose has no onValueChange selection model.
  onValueChange: () => undefined,
});

// @ts-expect-error Missing accessible naming is rejected in JSX too.
const _missingName = <Carousel items={[]} />;
