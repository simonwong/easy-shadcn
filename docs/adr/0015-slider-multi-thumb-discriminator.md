# Slider preserves scalar mode and discriminates multi-thumb values

The original Slider deliberately converted one public number to the primitive's array boundary. That kept the base case small, but changing a control into a range forced consumers to replace the Compose component and rebuild its visible value, accessible naming, form, and callback wiring with primitives.

## Decision

Slider keeps scalar mode as the default: `label`, scalar `value` / `defaultValue`, and scalar callbacks remain unchanged. `multiple=true` selects an array-valued branch. That branch alone exposes `minStepsBetweenValues` and `thumbCollisionBehavior`, defaults to `[min, max]`, and renders its raw values joined by an en dash.

Multi mode requires `thumbLabels`; callers use at least two values and names for a multi-thumb control, while runtime thumb count follows the value array length. Every Base UI Thumb receives an explicit numeric `index` for server rendering and a distinct accessible name in value order. A missing, empty, or short runtime label array does not crash rendering; unnamed positions fall back to `Value N`. The visible label names Base UI's slider group.

The Compose implementation uses Base UI Slider parts directly in `registry/ui/slider.tsx` so it can own per-thumb indices and names. It mirrors the official shadcn Slider structure and styling without modifying the CLI-owned Primitive. Base UI continues to own value constraints, sorting, pointer and keyboard interaction, form inputs, collision behavior, and cancelable event details.

## Alternatives rejected

- Changing the original `value` prop to `number | number[]` without a discriminator would weaken callback inference and make mode-only props ambiguous.
- Calling a two-thumb case `range` would not cover three or more thresholds and would create another migration when thumb count grows.
- Keeping multi-thumb entirely primitive-only preserves the expensive migration this Compose enhancement exists to remove.
- Optional thumb names would ship indistinguishable slider controls to assistive technology.

## Consequences

Existing scalar callers make no change. A caller can migrate to any thumb count by adding `multiple`, switching value state to an array, and supplying names. Formatting, locale, marks, tooltips, arbitrary descendants, and custom thumb props remain Primitive escape paths.
