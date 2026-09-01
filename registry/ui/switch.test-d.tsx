import type { SwitchProps } from "./switch";

declare const acceptProps: (props: SwitchProps) => undefined;

acceptProps({
  "aria-describedby": "details",
  "aria-label": "Notifications",
  checked: true,
  className: ["control-x", false],
  description: "Receive updates",
  descriptionClassName: ["description-x", null],
  disabled: false,
  form: "settings-form",
  inputRef: (node) => {
    node?.checkValidity();
  },
  label: "Notifications",
  labelClassName: ["label-x", undefined],
  name: "notifications",
  onCheckedChange: (_checked, details) => {
    details.cancel();
  },
  onClick: (event) => {
    event.preventBaseUIHandler();
  },
  optionClassName: ["option-x", false],
  readOnly: false,
  ref: (node) => {
    node?.focus();
  },
  required: true,
  size: "sm",
  style: { opacity: 0.5 },
  uncheckedValue: "off",
  value: "on",
});

// @ts-expect-error Switch requires caller-owned label content.
acceptProps({});

// @ts-expect-error Switch owns its child structure.
acceptProps({ children: "Bypass", label: "Notifications" });

acceptProps({
  // @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  label: "Notifications",
});

// @ts-expect-error Root rendering is fixed by the Compose component.
acceptProps({ label: "Notifications", render: <button type="button" /> });

// @ts-expect-error The visible root remains the primitive span contract.
acceptProps({ label: "Notifications", nativeButton: true });

// @ts-expect-error Checked ARIA is derived from checked state.
acceptProps({ "aria-checked": true, label: "Notifications" });

// @ts-expect-error Disabled ARIA is derived from disabled state.
acceptProps({ "aria-disabled": true, label: "Notifications" });

// @ts-expect-error Readonly ARIA is derived from readOnly state.
acceptProps({ "aria-readonly": true, label: "Notifications" });

// @ts-expect-error Required ARIA is derived from required state.
acceptProps({ "aria-required": true, label: "Notifications" });

// @ts-expect-error Checked data state is primitive-owned.
acceptProps({ "data-checked": "", label: "Notifications" });

// @ts-expect-error Disabled data state is primitive-owned.
acceptProps({ "data-disabled": "", label: "Notifications" });

// @ts-expect-error The size marker is derived from size.
acceptProps({ "data-size": "sm", label: "Notifications" });

// @ts-expect-error The primitive slot marker is Compose-owned.
acceptProps({ "data-slot": "bypass", label: "Notifications" });

// @ts-expect-error Switch owns its root role.
acceptProps({ label: "Notifications", role: "checkbox" });

// @ts-expect-error Content slots expose their own class hooks, not a shared wrapper hook.
acceptProps({ contentClassName: "content-x", label: "Notifications" });
