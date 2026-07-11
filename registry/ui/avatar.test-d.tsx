import type { AvatarProps } from "./avatar";

declare const acceptProps: (props: AvatarProps) => undefined;

declare const optionalSource: string | undefined;

acceptProps({
  "aria-label": "Ada Lovelace",
  alt: "Portrait of Ada Lovelace",
  badge: <span className="sr-only">Online</span>,
  badgeClassName: ["badge-x", false],
  className: ["root-x", null],
  fallback: "AL",
  fallbackClassName: ["fallback-x", undefined],
  imageClassName: ["image-x", false],
  ref: (node) => {
    node?.getAttribute("data-size");
  },
  role: "img",
  size: "lg",
  src: optionalSource,
});

// @ts-expect-error Avatar requires caller-owned fallback content.
acceptProps({});

// @ts-expect-error Avatar owns its child structure.
acceptProps({ children: "Bypass", fallback: "AL" });

// @ts-expect-error Raw HTML conflicts with Compose-owned parts.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, fallback: "AL" });

// @ts-expect-error Root rendering is fixed by the Compose component.
acceptProps({ fallback: "AL", render: <div /> });

// @ts-expect-error Complete image prop bags remain on the primitive.
acceptProps({ fallback: "AL", srcSet: "/avatar@2x.png 2x" });
