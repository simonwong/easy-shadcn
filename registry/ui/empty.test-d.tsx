import { createRef } from "react";
import type { EmptyProps } from "./empty";

declare const acceptProps: (props: EmptyProps) => undefined;

acceptProps({});
acceptProps({
  className: ["root-x", false],
  content: 0,
  contentClassName: ["content-x", null],
  description: false,
  descriptionClassName: ["description-x", undefined],
  headerClassName: ["header-x", false],
  media: "",
  mediaClassName: ["media-x", null],
  mediaVariant: "icon",
  title: <span>No projects</span>,
  titleClassName: ["title-x", undefined],
});
acceptProps({ media: "Avatar", mediaVariant: "default" });
acceptProps({
  "aria-label": "Project state",
  contentEditable: true,
  "data-tracking": "empty-projects",
  id: "project-empty",
  onClick: () => undefined,
  ref: createRef<HTMLDivElement>(),
  role: "status",
  style: { marginTop: 12 },
  suppressContentEditableWarning: true,
});

// @ts-expect-error Empty owns its child structure through flat content props.
acceptProps({ children: "Bypass" });

// @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" } });

// @ts-expect-error The official primitive slot marker is Compose-owned.
acceptProps({ "data-slot": "bypass-empty" });

// @ts-expect-error Media variants remain aligned to the official primitive.
acceptProps({ media: "Video", mediaVariant: "video" });

// @ts-expect-error Border styling belongs in className.
acceptProps({ bordered: true });

// @ts-expect-error Size styling belongs in className.
acceptProps({ size: "sm" });

// @ts-expect-error Alignment styling belongs in className.
acceptProps({ align: "start" });

// @ts-expect-error EmptyContent is the primitive-aligned slot name.
acceptProps({ action: <button type="button">Create</button> });

// @ts-expect-error Header prop bags bypass explicit ownership.
acceptProps({ headerProps: {} });

// @ts-expect-error Media prop bags bypass explicit ownership.
acceptProps({ mediaProps: {} });

// @ts-expect-error Title prop bags bypass explicit ownership.
acceptProps({ titleProps: {} });

// @ts-expect-error Description prop bags bypass explicit ownership.
acceptProps({ descriptionProps: {} });

// @ts-expect-error Content prop bags bypass explicit ownership.
acceptProps({ contentProps: {} });

// @ts-expect-error Root prop bags bypass the explicit root interface.
acceptProps({ rootProps: {} });

// @ts-expect-error Slot objects bypass the flat interface.
acceptProps({ slots: {} });

// @ts-expect-error Render replacement is a primitive escape path.
acceptProps({ render: <div /> });

// @ts-expect-error asChild polymorphism is a primitive escape path.
acceptProps({ asChild: true });

// @ts-expect-error Element polymorphism is a primitive escape path.
acceptProps({ as: "section" });

// @ts-expect-error Insertion props violate the fixed primitive order.
acceptProps({ beforeContent: <hr /> });

// @ts-expect-error Loading state is caller-owned.
acceptProps({ loading: true });

// @ts-expect-error Error state is caller-owned.
acceptProps({ error: "Failed" });

// @ts-expect-error Retry behavior is caller-owned.
acceptProps({ onRetry: () => undefined });

// @ts-expect-error Localization machinery is out of scope.
acceptProps({ locale: "en" });
