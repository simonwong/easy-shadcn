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

// @ts-expect-error Content slots expose their own class hooks, not a shared wrapper hook.
acceptProps({ contentClassName: "content-x", label: "Notifications" });
