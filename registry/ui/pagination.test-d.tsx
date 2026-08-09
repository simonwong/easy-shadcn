import { Pagination, type PaginationProps } from "./pagination";

declare const acceptProps: (props: PaginationProps) => undefined;
declare const acceptNumber: (value: number) => undefined;

acceptProps({
  "aria-label": "Search result pages",
  boundaryCount: 2,
  className: ["root-x", false],
  contentClassName: ["content-x", null],
  defaultValue: 2,
  disabled: false,
  ellipsisClassName: ["ellipsis-x", undefined],
  hideOnSinglePage: true,
  id: "result-pages",
  itemClassName: ["item-x", false],
  linkClassName: ["link-x", null],
  nextClassName: ["next-x", undefined],
  onClick: (event) => {
    event.currentTarget.dataset.clicked = "true";
  },
  onValueChange: (value) => {
    acceptNumber(value);
  },
  pageSize: 25,
  previousClassName: ["previous-x", false],
  ref: (node) => {
    node?.focus();
  },
  siblingCount: 2,
  style: { opacity: 0.5 },
  total: 250,
});

acceptProps({
  onValueChange: (value) => acceptNumber(value),
  total: 100,
  value: 4,
});

acceptProps({
  getPageHref: (page) => `/reports?page=${page}`,
  total: 100,
  value: 4,
});

// @ts-expect-error Client mode requires an observable value callback.
acceptProps({ total: 100 });

// @ts-expect-error Controlled and uncontrolled client ownership are mutually exclusive.
acceptProps({
  defaultValue: 2,
  onValueChange: () => undefined,
  total: 100,
  value: 3,
});

// @ts-expect-error Route hrefs cannot be combined with a client callback.
acceptProps({
  getPageHref: (page: number) => `/pages/${page}`,
  onValueChange: () => undefined,
  total: 100,
  value: 3,
});

// @ts-expect-error Navigation mode rejects client-owned initial state.
acceptProps({
  defaultValue: 2,
  getPageHref: (page: number) => `/pages/${page}`,
  total: 100,
  value: 3,
});

// @ts-expect-error Navigation mode requires a controlled route-derived value.
acceptProps({ getPageHref: (page) => `/pages/${page}`, total: 100 });

// @ts-expect-error Compose owns the complete child structure.
acceptProps({ children: "Bypass", onValueChange: () => undefined, total: 100 });

acceptProps({
  // @ts-expect-error Raw HTML conflicts with generated descendants.
  dangerouslySetInnerHTML: { __html: "Bypass" },
  onValueChange: () => undefined,
  total: 100,
});

acceptProps({
  onValueChange: () => undefined,
  // @ts-expect-error The navigation landmark role is Compose-owned.
  role: "presentation",
  total: 100,
});

// @ts-expect-error antd current vocabulary is not part of the Compose API.
acceptProps({ current: 2, onValueChange: () => undefined, total: 100 });

// @ts-expect-error page/onPageChange aliases are not part of the Compose API.
acceptProps({ onPageChange: () => undefined, page: 2, total: 100 });

acceptProps({
  onValueChange: () => undefined,
  // @ts-expect-error Built-in Previous/Next copy is intentionally fixed.
  previousText: "Back",
  total: 100,
});

// @ts-expect-error Per-page prop bags belong to primitive composition.
acceptProps({ linkProps: {}, onValueChange: () => undefined, total: 100 });

acceptProps({
  // @ts-expect-error Item renderers belong to primitive composition.
  itemRender: () => null,
  onValueChange: () => undefined,
  total: 100,
});

// @ts-expect-error Slots objects are not part of the flat API.
acceptProps({ onValueChange: () => undefined, slots: {}, total: 100 });

const _slotBypass = (
  // @ts-expect-error The primitive slot marker remains Compose-owned.
  <Pagination data-slot="forged" onValueChange={() => undefined} total={100} />
);
