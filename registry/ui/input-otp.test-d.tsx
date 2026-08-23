import { REGEXP_ONLY_DIGITS } from "input-otp";
import { createRef } from "react";
import { InputOTP, type InputOTPProps } from "./input-otp";

declare const acceptProps: (props: InputOTPProps) => undefined;

acceptProps({
  "aria-describedby": "otp-help",
  "aria-invalid": "grammar",
  "aria-label": "Verification code",
  autoComplete: "one-time-code",
  className: ["input-x", false],
  containerClassName: ["container-x", null],
  defaultValue: "123",
  disabled: false,
  form: "verify-form",
  groupClassName: ["group-x", undefined],
  groupSize: 3,
  inputMode: "numeric",
  maxLength: 6,
  name: "code",
  noScriptCSSFallback: null,
  nonce: "otp-nonce",
  onChange: (value) => value.toUpperCase(),
  onComplete: (value) => String(value),
  pasteTransformer: (value) => value.replaceAll("-", ""),
  pattern: REGEXP_ONLY_DIGITS,
  placeholder: "••••••",
  pushPasswordManagerStrategy: "none",
  ref: createRef<HTMLInputElement>(),
  required: true,
  separatorClassName: ["separator-x", false],
  slotClassName: ["slot-x", null],
  spellCheck: false,
  textAlign: "left",
  value: "123456",
});

// @ts-expect-error maxLength is required.
acceptProps({});

// @ts-expect-error Compose owns the generated children.
acceptProps({ children: "Bypass", maxLength: 6 });

// @ts-expect-error Compose owns rendering.
acceptProps({ maxLength: 6, render: () => null });

// @ts-expect-error The primitive slot marker is Compose-owned.
acceptProps({ "data-slot": "forged", maxLength: 6 });

acceptProps({
  // @ts-expect-error Raw input HTML conflicts with generated descendants.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  maxLength: 6,
});

// @ts-expect-error OTP defaultValue is string-only.
acceptProps({ defaultValue: 123, maxLength: 6 });

// @ts-expect-error OTP defaultValue is string-only.
acceptProps({ defaultValue: ["1", "2"], maxLength: 6 });

// @ts-expect-error The ref targets the real input, not a div.
acceptProps({ maxLength: 6, ref: createRef<HTMLDivElement>() });

// @ts-expect-error Primitive naming stays onChange, not onValueChange.
acceptProps({ maxLength: 6, onValueChange: () => undefined });

const _valid = <InputOTP maxLength={6} ref={createRef<HTMLInputElement>()} />;

const _slotBypass = (
  // @ts-expect-error data-slot remains Compose-owned in JSX.
  <InputOTP data-slot="forged" maxLength={6} />
);
