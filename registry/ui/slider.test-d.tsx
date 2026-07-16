import type { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { Slider, type SliderProps } from "./slider";

declare const acceptProps: (props: SliderProps) => undefined;
declare const acceptNumber: (value: number) => undefined;
declare const acceptChangeDetails: (
  details: SliderPrimitive.Root.ChangeEventDetails
) => undefined;
declare const acceptCommitDetails: (
  details: SliderPrimitive.Root.CommitEventDetails
) => undefined;

acceptProps({
  "aria-labelledby": "external-label",
  className: ["control-x", false],
  defaultValue: 25,
  disabled: false,
  form: "settings-form",
  id: "volume-slider",
  label: "Volume",
  labelClassName: ["label-x", null],
  largeStep: 10,
  max: 100,
  min: 0,
  name: "volume",
  onClick: (event) => {
    event.preventBaseUIHandler();
  },
  onValueChange: (value, details) => {
    acceptNumber(value);
    acceptChangeDetails(details);
    details.cancel();
  },
  onValueCommitted: (value, details) => {
    acceptNumber(value);
    acceptCommitDetails(details);
  },
  orientation: "vertical",
  showValue: false,
  step: 5,
  style: { opacity: 0.5 },
  thumbAlignment: "center",
  value: 40,
  valueClassName: ["value-x", undefined],
});

// @ts-expect-error Slider requires a visible caller-owned label.
acceptProps({});

// @ts-expect-error The Compose value is scalar-only.
acceptProps({ label: "Range", value: [20, 80] });

// @ts-expect-error The Compose default value is scalar-only.
acceptProps({ defaultValue: [20, 80], label: "Range" });

acceptProps({
  label: "Volume",
  // @ts-expect-error Change callbacks receive a scalar number.
  onValueChange: (_value: number[]) => undefined,
});

acceptProps({
  label: "Volume",
  // @ts-expect-error Commit callbacks receive a scalar number.
  onValueCommitted: (_value: number[]) => undefined,
});

// @ts-expect-error Compose owns the complete child structure.
acceptProps({ children: "Bypass", label: "Volume" });

acceptProps({
  // @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  label: "Volume",
});

// @ts-expect-error Root replacement is a primitive escape path.
acceptProps({ label: "Volume", render: <div /> });

// @ts-expect-error Range spacing belongs to the multi-thumb primitive.
acceptProps({ label: "Range", minStepsBetweenValues: 2 });

// @ts-expect-error Thumb collision policy belongs to the multi-thumb primitive.
acceptProps({ label: "Range", thumbCollisionBehavior: "swap" });

// @ts-expect-error Formatting is intentionally outside the thin wrapper.
acceptProps({ format: { style: "percent" }, label: "Volume" });

// @ts-expect-error Locale/i18n mechanisms are not part of the Compose API.
acceptProps({ label: "Volume", locale: "de-DE" });

// @ts-expect-error The visible label is the supported accessible-name path.
acceptProps({ "aria-label": "Bypass", label: "Volume" });

// @ts-expect-error Descriptions need explicit primitive composition.
acceptProps({ "aria-describedby": "details", label: "Volume" });

// @ts-expect-error Numeric ARIA is derived by the primitive from value.
acceptProps({ "aria-valuenow": 75, label: "Volume" });

// @ts-expect-error Numeric ARIA is derived by the primitive from min.
acceptProps({ "aria-valuemin": -100, label: "Volume" });

// @ts-expect-error Numeric ARIA is derived by the primitive from max.
acceptProps({ "aria-valuemax": 200, label: "Volume" });

// @ts-expect-error Orientation semantics are derived from orientation.
acceptProps({ "aria-orientation": "vertical", label: "Volume" });

// @ts-expect-error The primitive owns its group role.
acceptProps({ label: "Volume", role: "slider" });

// @ts-expect-error Description content is outside this thin wrapper.
acceptProps({ description: "Adjust playback volume.", label: "Volume" });

// @ts-expect-error Marks are a primitive/custom-composition feature.
acceptProps({ label: "Volume", marks: [0, 50, 100] });

// @ts-expect-error Slots objects are not part of the flat API.
acceptProps({ label: "Volume", slots: {} });

// @ts-expect-error Root prop bags would bypass explicit ownership.
acceptProps({ label: "Volume", rootProps: {} });

// @ts-expect-error Label prop bags are not needed for a content slot.
acceptProps({ label: "Volume", labelProps: {} });

// @ts-expect-error Value prop bags are not needed for a content slot.
acceptProps({ label: "Volume", valueProps: {} });

// @ts-expect-error Render callbacks belong to primitive composition.
acceptProps({ formatValue: () => "40%", label: "Volume" });

// JSX accepts arbitrary hyphenated attributes unless ownership is explicit.
const _slotBypass = (
  // @ts-expect-error The primitive slot marker remains Compose-owned.
  <Slider data-slot="forged" label="Volume" />
);

const _stateBypass = (
  // @ts-expect-error Primitive state markers remain Compose-owned.
  <Slider data-disabled label="Volume" />
);

const _orientationBypass = (
  // @ts-expect-error Primitive orientation markers remain Compose-owned.
  <Slider data-orientation="vertical" label="Volume" />
);
