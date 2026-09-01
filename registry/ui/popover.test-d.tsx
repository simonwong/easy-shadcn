import type { PopoverProps } from "./popover";

declare const acceptProps: (props: PopoverProps) => undefined;

const trigger = <button type="button">Open</button>;
const previewTrigger = <a href="/profile">Simon</a>;

acceptProps({
  align: "start",
  content: "Editable content",
  defaultOpen: true,
  disabled: false,
  onOpenChange: (_open, details) => {
    details.cancel();
  },
  side: "top",
  children: trigger,
});

acceptProps({
  children: previewTrigger,
  closeDelay: 200,
  content: "Profile preview",
  delay: 300,
  interaction: "hover",
  onOpenChange: (_open, details) => {
    details.preventUnmountOnClose();
  },
  open: true,
});

// @ts-expect-error Hover delay does not leak into the default click API.
acceptProps({ children: trigger, content: "Body", delay: 100 });

// @ts-expect-error Click trigger disabling is not a Preview Card concept.
acceptProps({
  children: previewTrigger,
  content: "Preview",
  disabled: true,
  interaction: "hover",
});

// @ts-expect-error Hover mode is explicit; arbitrary interaction values are rejected.
acceptProps({ children: trigger, content: "Body", interaction: "focus" });

// @ts-expect-error Compose owns the trigger and popup child structure.
acceptProps({ children: "Open", content: "Body" });

acceptProps({
  children: trigger,
  content: "Body",
  // @ts-expect-error Raw HTML conflicts with Compose-owned click popup children.
  dangerouslySetInnerHTML: { __html: "Bypass" },
});

acceptProps({
  children: previewTrigger,
  content: "Preview",
  // @ts-expect-error Raw HTML conflicts with Compose-owned hover popup children.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  interaction: "hover",
});

acceptProps({
  children: previewTrigger,
  content: "Preview",
  interaction: "hover",
  // @ts-expect-error Trigger ids are internal adapter plumbing.
  triggerId: "forged",
});

acceptProps({
  children: trigger,
  content: "Body",
  // @ts-expect-error Popup element replacement bypasses the generated click content.
  render: <section />,
});

acceptProps({
  children: previewTrigger,
  content: "Preview",
  interaction: "hover",
  // @ts-expect-error Popup element replacement bypasses the generated hover content.
  render: <section />,
});

acceptProps({
  children: trigger,
  content: "Body",
  // @ts-expect-error The popup slot marker is Compose-owned.
  "data-slot": "bypass",
});
