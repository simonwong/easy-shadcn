import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { createRef } from "react";
import { Sheet, type SheetProps } from "./sheet";

declare const acceptProps: (props: SheetProps) => undefined;
declare const acceptChangeDetails: (
  details: DialogPrimitive.Root.ChangeEventDetails
) => undefined;

const popupRef = createRef<HTMLDivElement>();
const focusRef = createRef<HTMLButtonElement>();

acceptProps({
  className: ["popup-x", false],
  content: "Account settings",
  contentClassName: ["body-x", null],
  defaultOpen: true,
  description: "Update the account details.",
  descriptionClassName: "description-x",
  disablePointerDismissal: true,
  finalFocus: focusRef,
  footer: <button type="button">Save</button>,
  footerClassName: "footer-x",
  headerClassName: "header-x",
  id: "account-sheet",
  initialFocus: false,
  onClick: (event) => {
    event.preventBaseUIHandler();
  },
  onOpenChange: (_open, details) => {
    acceptChangeDetails(details);
    details.cancel();
  },
  onOpenChangeComplete: (_open) => undefined,
  open: true,
  ref: popupRef,
  showCloseButton: false,
  side: "left",
  style: { width: "20rem" },
  title: "Edit account",
  titleClassName: ["title-x", undefined],
  trigger: <button type="button">Open</button>,
});

// @ts-expect-error Sheet requires title and content.
acceptProps({});

// @ts-expect-error Sheet requires a visible title.
acceptProps({ content: "Account settings" });

// @ts-expect-error Sheet requires body content.
acceptProps({ title: "Edit account" });

// @ts-expect-error Trigger composition requires an element.
acceptProps({ content: "Body", title: "Title", trigger: "Open" });

// @ts-expect-error Side must align with the shadcn Sheet primitive.
acceptProps({ content: "Body", side: "center", title: "Title" });

// @ts-expect-error Compose owns the complete child structure.
acceptProps({ children: "Bypass", content: "Body", title: "Title" });

acceptProps({
  content: "Body",
  // @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  title: "Title",
});

// @ts-expect-error Root replacement is a primitive escape path.
acceptProps({ content: "Body", render: <section />, title: "Title" });

// @ts-expect-error The visible title is the supported accessible-name path.
acceptProps({ "aria-label": "Bypass", content: "Body", title: "Title" });

acceptProps({
  // @ts-expect-error The primitive derives the title relationship.
  "aria-labelledby": "external-title",
  content: "Body",
  title: "Title",
});

acceptProps({
  // @ts-expect-error The primitive derives the description relationship.
  "aria-describedby": "external-description",
  content: "Body",
  title: "Title",
});

// @ts-expect-error Modal semantics remain primitive-owned.
acceptProps({ "aria-modal": true, content: "Body", title: "Title" });

// @ts-expect-error The primitive owns its dialog role.
acceptProps({ content: "Body", role: "alertdialog", title: "Title" });

// @ts-expect-error Non-modal behavior belongs to primitive composition.
acceptProps({ content: "Body", modal: false, title: "Title" });

// @ts-expect-error Imperative action refs are outside the thin wrapper.
acceptProps({ actionsRef: createRef(), content: "Body", title: "Title" });

// @ts-expect-error External Dialog handles are outside the thin wrapper.
acceptProps({ content: "Body", handle: {}, title: "Title" });

// @ts-expect-error Trigger identity coordination is outside the thin wrapper.
acceptProps({ content: "Body", triggerId: "trigger", title: "Title" });

// @ts-expect-error Default trigger identity is outside the thin wrapper.
acceptProps({ content: "Body", defaultTriggerId: "trigger", title: "Title" });

// @ts-expect-error Overlay styling is a primitive escape path.
acceptProps({ content: "Body", overlayClassName: "overlay-x", title: "Title" });

// @ts-expect-error Portal prop bags are not part of the flat API.
acceptProps({ content: "Body", portalProps: {}, title: "Title" });

// @ts-expect-error Trigger prop bags would weaken ownership.
acceptProps({ content: "Body", title: "Title", triggerProps: {} });

// @ts-expect-error Footer prop bags are not needed for a content slot.
acceptProps({ content: "Body", footerProps: {}, title: "Title" });

// @ts-expect-error Content prop bags would bypass explicit ownership.
acceptProps({ content: "Body", contentProps: {}, title: "Title" });

// @ts-expect-error Slots objects are not part of the flat API.
acceptProps({ content: "Body", slots: {}, title: "Title" });

// @ts-expect-error The built-in close label is fixed English API copy.
acceptProps({ closeText: "Dismiss", content: "Body", title: "Title" });

const _dataTestId = (
  <Sheet content="Body" data-testid="account-sheet" title="Title" />
);

const _slotBypass = (
  // @ts-expect-error The primitive slot marker remains Compose-owned.
  <Sheet content="Body" data-slot="forged" title="Title" />
);

const _sideBypass = (
  // @ts-expect-error Placement markers are derived from side.
  <Sheet content="Body" data-side="left" title="Title" />
);

const _stateBypass = (
  // @ts-expect-error Primitive state markers remain Compose-owned.
  <Sheet content="Body" data-open title="Title" />
);
