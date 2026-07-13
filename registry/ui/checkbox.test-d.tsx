import type { CheckboxProps } from "./checkbox";

declare const acceptProps: (props: CheckboxProps) => undefined;

acceptProps({
  "aria-describedby": "details",
  "aria-label": "Accept terms",
  checked: true,
  className: ["control-x", false],
  description: "Required to continue",
  descriptionClassName: ["description-x", null],
  disabled: false,
  form: "terms-form",
  inputRef: (node) => {
    node?.checkValidity();
  },
  label: "Accept terms",
  labelClassName: ["label-x", undefined],
  name: "terms",
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
  style: (state) => ({ opacity: state.checked ? 1 : 0.5 }),
  uncheckedValue: "off",
  value: "on",
});

// @ts-expect-error Checkbox requires caller-owned label content.
acceptProps({});

// @ts-expect-error Checkbox owns its child structure.
acceptProps({ children: "Bypass", label: "Accept terms" });

acceptProps({
  // @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  label: "Accept terms",
});

// @ts-expect-error Root rendering is fixed by the Compose component.
acceptProps({ label: "Accept terms", render: <button type="button" /> });

// @ts-expect-error The visible root remains the primitive span contract.
acceptProps({ label: "Accept terms", nativeButton: true });

// @ts-expect-error Parent/select-all semantics remain on the primitive.
acceptProps({ label: "Accept terms", parent: true });

// @ts-expect-error Mixed state is not faithfully represented by this wrapper.
acceptProps({ indeterminate: true, label: "Accept terms" });

// @ts-expect-error The checkbox role is derived by the primitive.
acceptProps({ label: "Accept terms", role: "switch" });

// @ts-expect-error Checked ARIA is derived from checked state.
acceptProps({ "aria-checked": "mixed", label: "Accept terms" });

// @ts-expect-error Disabled ARIA is derived from disabled state.
acceptProps({ "aria-disabled": true, label: "Accept terms" });

// @ts-expect-error Read-only ARIA is derived from readOnly state.
acceptProps({ "aria-readonly": true, label: "Accept terms" });

// @ts-expect-error Required ARIA is derived from required state.
acceptProps({ "aria-required": true, label: "Accept terms" });

// @ts-expect-error The primitive slot marker is Compose-owned.
acceptProps({ "data-slot": "forged", label: "Accept terms" });

// @ts-expect-error Content slots do not expose prop bags.
acceptProps({ label: "Accept terms", labelProps: {} });

// @ts-expect-error Description content does not expose a prop bag.
acceptProps({ description: "Details", descriptionProps: {}, label: "Terms" });

// @ts-expect-error The outer option does not expose a wrapper prop bag.
acceptProps({ label: "Accept terms", optionProps: {} });

// @ts-expect-error Primitive root props stay flat instead of nesting in a bag.
acceptProps({ label: "Accept terms", rootProps: {} });

// @ts-expect-error Slots objects are not part of the flat API.
acceptProps({ label: "Accept terms", slots: {} });

// @ts-expect-error Insert-between-owned-parts props are outside the flat API.
acceptProps({ betweenControlAndLabel: <span />, label: "Accept terms" });

// @ts-expect-error Checkbox has no locale or i18n mechanism.
acceptProps({ label: "Accept terms", locale: "en-US" });
