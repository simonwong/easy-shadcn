import type { AsyncButtonProps } from "./async-button";

declare const acceptAsyncButtonProps: (props: AsyncButtonProps) => void;

acceptAsyncButtonProps({
  children: "Save",
  className: "save-x",
  disabled: false,
  endIcon: <span>End</span>,
  form: "save-form",
  loading: false,
  onClick: async () => undefined,
  size: "sm",
  startIcon: <span>Start</span>,
  type: "submit",
  variant: "outline",
});

// @ts-expect-error Busy state is derived from loading and Promise state.
acceptAsyncButtonProps({ "aria-busy": true });
// @ts-expect-error Disabled semantics are derived from disabled/loading.
acceptAsyncButtonProps({ "aria-disabled": true });
// @ts-expect-error The primitive slot marker is Compose-owned.
acceptAsyncButtonProps({ "data-slot": "replace" });
// @ts-expect-error Raw HTML conflicts with the Compose-owned spinner structure.
acceptAsyncButtonProps({ dangerouslySetInnerHTML: { __html: "Replace" } });
// @ts-expect-error AsyncButton always renders a native button.
acceptAsyncButtonProps({ nativeButton: false });
// @ts-expect-error Render replacement can bypass async click ownership.
acceptAsyncButtonProps({ render: <a href="/replace">Replace</a> });
// @ts-expect-error AsyncButton owns native button semantics.
acceptAsyncButtonProps({ role: "link" });
