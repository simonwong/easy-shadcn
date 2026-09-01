import type { ReactNode } from "react";
import { Field, type FieldProps } from "./field";

declare const acceptProps: (props: FieldProps) => undefined;
declare const acceptJsx: (node: ReactNode) => undefined;

acceptProps({
  "aria-describedby": "field-help",
  "aria-label": "Account email",
  children: <input type="email" />,
  className: ["field-x", false],
  id: "email-field-root",
  onClick: () => undefined,
  ref: (node) => {
    node?.focus();
  },
  style: { opacity: 0.5 },
});

acceptJsx(
  <Field data-testid="email-field" data-trace="field-root">
    <input type="email" />
  </Field>
);

// @ts-expect-error Raw HTML conflicts with Field descendants.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" } });

// @ts-expect-error Field owns its root role.
acceptProps({ role: "presentation" });

// @ts-expect-error The primitive root slot is Field-owned.
acceptProps({ "data-slot": "bypass" });

// @ts-expect-error The orientation marker is derived from orientation.
acceptProps({ "data-orientation": "horizontal" });

// @ts-expect-error Disabled ARIA is derived from disabled.
acceptProps({ "aria-disabled": true });

// @ts-expect-error Invalid ARIA belongs on the flat control, not the root.
acceptProps({ "aria-invalid": true });

// @ts-expect-error The disabled marker is derived from disabled.
acceptProps({ "data-disabled": "" });

// @ts-expect-error The invalid marker is derived from invalid and error.
acceptProps({ "data-invalid": "" });
