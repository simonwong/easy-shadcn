import type { DateRange } from "react-day-picker";
import { Calendar, type CalendarProps } from "./calendar";

declare const acceptProps: (props: CalendarProps) => undefined;

acceptProps({
  "aria-label": "Release calendar",
  className: "calendar-x",
  defaultMonth: new Date(2026, 8, 1),
  formatters: {
    formatDay: (date) => String(date.getDate()),
  },
  id: "release-calendar",
  mode: "single",
  onSelect: (selected) => selected?.getTime(),
  role: "application",
  selected: new Date(2026, 8, 2),
  style: { width: 320 },
});

acceptProps({
  mode: "multiple",
  onSelect: (selected) => selected?.map((date) => date.getTime()),
  selected: [new Date(2026, 8, 2)],
});

acceptProps({
  mode: "range",
  onSelect: (selected) => selected?.from?.getTime(),
  selected: {
    from: new Date(2026, 8, 2),
    to: new Date(2026, 8, 4),
  } satisfies DateRange,
});

// @ts-expect-error Calendar fixes the primitive caption layout.
acceptProps({ captionLayout: "dropdown" });

// @ts-expect-error Calendar owns the primitive component adapters.
acceptProps({ components: {} });

// @ts-expect-error Calendar fixes the root slot marker.
acceptProps({ "data-slot": "consumer-calendar" });

// @ts-expect-error Calendar owns date math used by its custom panels.
acceptProps({ dateLib: {} });

// @ts-expect-error Calendar always renders six week rows.
acceptProps({ fixedWeeks: false });

// @ts-expect-error Calendar derives primitive navigation visibility from its panels.
acceptProps({ hideNavigation: false });

acceptProps({
  formatters: {
    // @ts-expect-error Calendar owns caption rendering and formatting.
    formatCaption: () => "Bypass",
  },
});

const _invalidSingleSelection = (
  // @ts-expect-error Single selection cannot receive an array value.
  <Calendar mode="single" selected={[new Date(2026, 8, 2)]} />
);
