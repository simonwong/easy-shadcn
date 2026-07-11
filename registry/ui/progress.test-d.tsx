import { Progress, type ProgressProps } from "./progress";

declare const acceptProps: (props: ProgressProps) => undefined;

acceptProps({
  "aria-describedby": "progress-details",
  "aria-label": "Upload progress",
  "aria-labelledby": "external-progress-label",
  "aria-valuetext": "1 of 4 batches",
  className: ["root-x", false],
  id: "upload-progress",
  label: "Upload progress",
  labelClassName: ["label-x", null],
  onClick: (event) => {
    event.currentTarget.dataset.clicked = "true";
  },
  ref: (node) => {
    node?.focus();
  },
  showValue: false,
  style: { opacity: 0.5 },
  value: 56,
  valueClassName: ["value-x", undefined],
});

acceptProps({
  "aria-valuetext": undefined,
  label: null,
  value: null,
});

// @ts-expect-error Progress requires caller-owned label content.
acceptProps({ value: 50 });

// @ts-expect-error Progress requires an explicit determinate or indeterminate value.
acceptProps({ label: "Upload" });

// @ts-expect-error Progress owns its child structure.
acceptProps({ children: "Bypass", label: "Upload", value: 50 });

acceptProps({
  // @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  label: "Upload",
  value: 50,
});

// @ts-expect-error Root rendering is fixed by the Compose component.
acceptProps({ label: "Upload", render: <button type="button" />, value: 50 });

// @ts-expect-error The progressbar role is Compose-owned.
acceptProps({ label: "Upload", role: "meter", value: 50 });

// @ts-expect-error Numeric ARIA is derived from value.
acceptProps({ "aria-valuenow": 25, label: "Upload", value: 50 });

// @ts-expect-error Numeric ARIA is derived from the fixed range.
acceptProps({ "aria-valuemin": -100, label: "Upload", value: 50 });

// @ts-expect-error Numeric ARIA is derived from the fixed range.
acceptProps({ "aria-valuemax": 200, label: "Upload", value: 50 });

// @ts-expect-error The fixed range is not configurable.
acceptProps({ label: "Upload", max: 200, value: 50 });

// @ts-expect-error The fixed range is not configurable.
acceptProps({ label: "Upload", min: -100, value: 50 });

// @ts-expect-error Formatting is fixed at the Compose layer.
acceptProps({ format: { style: "unit" }, label: "Upload", value: 50 });

// @ts-expect-error Visible formatting callbacks belong in the primitive escape hatch.
acceptProps({ formatValue: () => "50 of 100", label: "Upload", value: 50 });

// @ts-expect-error Locale is fixed at the Compose layer.
acceptProps({ label: "Upload", locale: "de-DE", value: 50 });

acceptProps({
  // @ts-expect-error The primitive formatter callback is not public.
  getAriaValueText: () => "Bypass",
  label: "Upload",
  value: 50,
});

// @ts-expect-error Content additions belong in the primitive escape hatch.
acceptProps({ description: "Details", label: "Upload", value: 50 });

// @ts-expect-error Status content belongs in the primitive escape hatch.
acceptProps({ label: "Upload", status: "Uploading", value: 50 });

// @ts-expect-error Track styling belongs in the primitive escape hatch.
acceptProps({ label: "Upload", trackClassName: "track-x", value: 50 });

// @ts-expect-error Indicator styling belongs in the primitive escape hatch.
acceptProps({ indicatorClassName: "indicator-x", label: "Upload", value: 50 });

// @ts-expect-error Prop bags are not part of the flat API.
acceptProps({ label: "Upload", labelProps: {}, value: 50 });

// @ts-expect-error Value prop bags are not part of the flat API.
acceptProps({ label: "Upload", value: 50, valueProps: {} });

// @ts-expect-error Root prop bags are not part of the flat API.
acceptProps({ label: "Upload", rootProps: {}, value: 50 });

// @ts-expect-error Slots objects are not part of the flat API.
acceptProps({ label: "Upload", slots: {}, value: 50 });

// JSX accepts arbitrary hyphenated attributes unless ownership is explicit.
const _numericAriaBypass = (
  // @ts-expect-error Numeric ARIA remains Compose-owned in JSX.
  <Progress aria-valuemax={200} label="Upload" value={50} />
);

// @ts-expect-error The primitive slot marker remains Compose-owned in JSX.
const _slotBypass = <Progress data-slot="forged" label="Upload" value={50} />;
