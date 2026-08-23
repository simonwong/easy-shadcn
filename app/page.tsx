import type { Metadata } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { CollapseDemo } from "./collapse-demo";

export const metadata: Metadata = createMetadata({
  title: {
    absolute: "easy/shadcn — the easy way to shadcn",
  },
  description:
    "Hand-stitched wrappers over shadcn/ui that swap nested children for flat props. Eighty percent of your UI ships with one tag — the other twenty, drop down to the primitive.",
  keywords: [
    "shadcn",
    "shadcn/ui",
    "react components",
    "component library",
    "tailwind css",
    "radix ui",
    "typescript",
    "flat props",
    "easy-shadcn",
    "shadcn registry",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "easy/shadcn — the easy way to shadcn",
    description:
      "Hand-stitched wrappers over shadcn/ui that swap nested children for flat props. 80% of your UI ships with one tag.",
  },
  twitter: {
    title: "easy/shadcn — the easy way to shadcn",
    description:
      "Hand-stitched wrappers over shadcn/ui that swap nested children for flat props.",
  },
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const display = Barlow_Semi_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700"],
});

const GITHUB_URL = "https://github.com/simonwong/easy-shadcn";

const DIRECTION_CONTRACT = `
DIRECTION CONTRACT — easy-shadcn landing (seed 9183be20)
THESIS: easy-shadcn is wayfinding for shadcn/ui — one glance locates every component and the command that installs it. Refuses the category default: dark gradient hero, bento grid, fake terminal glow.
OWN-WORLD: warm off-white #FAF9F7 ground, ink #111 type, logo coral #EB5436 as the single accent (from the brand mark), warm gray #5C5C54 secondary. Barlow Semi Condensed destination type, Barlow body, Geist Mono for code and commands. One accent word per headline, quiet hairlines, drawn SVG arrows.
STORY: three seconds in, the visitor knows nested children become flat props; the route map shows all 28 stops; one install command is at hand; the express line covers the npm package.
FIRST VIEWPORT: quiet masthead with the coral-slash logo; condensed destination headline "THE EASY WAY TO SHADCN" with EASY in logo coral; short platform-information sub; one solid ink primary action; one clean install card.
FORM: grounded candidate "transit wayfinding", assigned by the roll (position 6 of 7), raised by donations: cape (one-pull collapse motion), ekiben (catalogue as numbered map), hoarding (one decisive word), hypercard (solid-inversion states), cutting bench (rank by allocation). Quieter pass: user-pinned logo coral replaced the roll's yellow field; ticker, ticket perforation, rail dots, and dark plates were distilled out.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`;

function Logo({ className }: { className?: string }) {
  return (
    <svg
      aria-label="easy-shadcn"
      className={className}
      fill="none"
      role="img"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>easy-shadcn</title>
      {/* the "easy" swoosh — coral stroke, lifting upward */}
      <path d="M4 24 Q 8 18, 14 13" stroke="var(--signal)" strokeWidth="4" />
      {/* the shadcn slash — ink stroke, parallel lift */}
      <path d="M15 26 Q 19 16, 26 8" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 64 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 16h54M44 4l14 12-14 12"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="6"
      />
    </svg>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function InstallCard() {
  return (
    <div className="border border-[var(--ink)]/15 bg-white">
      <div className="flex items-center justify-between border-[var(--ink)]/10 border-b px-5 py-3">
        <span className="font-semibold text-[10px] text-[var(--muted)] uppercase tracking-[0.24em]">
          Install any component
        </span>
        <span className="font-mono text-[10px] text-[var(--muted)]">
          shadcn CLI
        </span>
      </div>
      <div className="px-5 py-5 font-mono text-[13px] leading-[1.7]">
        <code>
          <span className="text-[var(--signal)]">$</span> pnpm dlx shadcn@latest
          add <span className="font-bold">@easy-shadcn/card</span>
        </code>
      </div>
    </div>
  );
}

const lines = [
  {
    id: "A",
    label: "Content & layout",
    stops: [
      {
        name: "Accordion",
        blurb:
          "Items array in. Expandable panels out. No nested triple per row.",
      },
      {
        name: "Alert",
        blurb: "Status banners with title, description and action. One tag.",
      },
      {
        name: "Avatar",
        blurb:
          "src + fallback, plus a badge slot. Initials when the image 404s.",
      },
      {
        name: "Breadcrumb",
        blurb:
          "Trail of items in. Auto current page and collapsing ellipsis out.",
      },
      {
        name: "Card",
        blurb: "Flat slots for title, description, action and footer.",
      },
      {
        name: "Empty",
        blurb:
          "Media, title, description and content. No compound scaffolding.",
      },
      {
        name: "Progress",
        blurb: "value in, bar out — null for indeterminate. Label included.",
      },
      {
        name: "Tabs",
        blurb: "Items array in. Tabs out. Heterogeneous? Use the primitive.",
      },
      {
        name: "Tooltip",
        blurb: "Wrap an element, pass content. Its own provider — zero setup.",
      },
    ],
  },
  {
    id: "B",
    label: "Forms & input",
    stops: [
      {
        name: "Calendar",
        blurb: "Three-view month/year navigation. No more native dropdowns.",
      },
      {
        name: "Checkbox",
        blurb: "A box and its label, in one tag. Disabled and all.",
      },
      {
        name: "Checkbox Group",
        blurb:
          "Items array in, checked values out. Per-item disabled included.",
      },
      {
        name: "Combobox",
        blurb:
          "Type to filter items, pick one. Custom filter and empty states.",
      },
      {
        name: "Date Picker",
        blurb: "Single, multiple, range, inline-input — one component.",
      },
      {
        name: "Field",
        blurb: "Label, control, description, error — correctly wired together.",
      },
      {
        name: "Input Group",
        blurb: "Start and end addons around an input. No flex gymnastics.",
      },
      {
        name: "Input OTP",
        blurb: "One real input. Slots, groups, and separators generated.",
      },
      {
        name: "Radio Group",
        blurb:
          "Options array in. Wired-up radio rows out. Labels and a11y included.",
      },
      {
        name: "Select",
        blurb: "Items, value, async search. The state machine, fully owned.",
      },
      {
        name: "Slider",
        blurb: "A labeled slider with showValue. No markup per mark.",
      },
      {
        name: "Switch",
        blurb: "A labeled toggle. Checked state without ceremony.",
      },
    ],
  },
  {
    id: "C",
    label: "Overlays & dialogs",
    stops: [
      {
        name: "Alert Dialog",
        blurb:
          "Confirm the dangerous thing. Async onConfirm, destructive variant.",
      },
      {
        name: "Dropdown Menu",
        blurb: "Menu items as data — icons, shortcuts, destructive rows.",
      },
      {
        name: "Context Menu",
        blurb: "Right-click target in. Flat actions at the pointer out.",
      },
      {
        name: "Modal",
        blurb: "Imperative alert & confirm, ready for command palettes.",
      },
      {
        name: "Popover",
        blurb: "Trigger and content, anchored. Placement without plumbing.",
      },
      {
        name: "Sheet",
        blurb: "An edge panel with title, description, footer — pick a side.",
      },
    ],
  },
  {
    id: "D",
    label: "Data & actions",
    stops: [
      {
        name: "Async Button",
        blurb: "Returns a Promise? It handles loading, icons and anti-flash.",
      },
      {
        name: "Pagination",
        blurb: "Client state or route links — two modes, never mixed.",
      },
      {
        name: "Table",
        blurb:
          "columns + dataSource + rowKey. Row selection with per-row control.",
      },
    ],
  },
];

const principles = [
  {
    no: "I",
    title: "Flat props, not nested children.",
    body: "One prop per slot. No more <CardHeader><CardTitle> ladders. Eighty percent of layouts ship with one tag.",
  },
  {
    no: "II",
    title: "Composition stays primitive.",
    body: "Compose layer never grows render props or slot objects. Need the other twenty? Drop down to components/ui/* — the door is unlocked.",
  },
  {
    no: "III",
    title: "Your code, your repo.",
    body: "Installed through the shadcn CLI. Every component lives inside your project, fully owned and trivially patched. No black box.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://easy-shadcn.vercel.app/#website",
      url: "https://easy-shadcn.vercel.app/",
      name: "easy/shadcn",
      description:
        "Hand-stitched wrappers over shadcn/ui that swap nested children for flat props.",
      inLanguage: "en",
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://easy-shadcn.vercel.app/#library",
      name: "easy-shadcn",
      description:
        "A compose layer over shadcn/ui — flat props, no render-prop carnival, your code in your repo.",
      programmingLanguage: "TypeScript",
      codeRepository: "https://github.com/simonwong/easy-shadcn",
      license: "https://opensource.org/licenses/MIT",
      author: { "@type": "Person", name: "Simon" },
    },
  ],
};

export default function Home() {
  return (
    <div
      className={`${barlow.variable} ${display.variable} landing-root relative min-h-screen w-full overflow-x-clip antialiased`}
    >
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is a static object we control
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: inert direction-contract comment, must survive the production build
        dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }}
        type="text/comment"
      />
      <Masthead />
      <Hero />
      <ServiceFacts />
      <Shortcut />
      <RouteMap />
      <ExpressLine />
      <Manifesto />
      <Departures />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Masthead() {
  return (
    <header className="relative z-10 border-[var(--ink)]/10 border-b">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10">
        <Link
          className="flex shrink-0 items-center gap-2.5 text-[var(--ink)]"
          href="/"
        >
          <Logo className="size-6" />
          <span className="hidden font-display font-semibold text-[15px] uppercase tracking-[0.08em] sm:inline">
            easy<span className="text-[var(--signal)]">/</span>shadcn
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 font-semibold text-[11px] uppercase tracking-[0.18em]">
          {[
            { label: "Docs", href: "/docs" },
            { label: "Preview", href: "/preview" },
            { label: "GitHub", href: GITHUB_URL, external: true },
          ].map((item) => (
            <Link
              className="inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1.5 transition-colors hover:text-[var(--signal-deep)] sm:px-3"
              href={item.href}
              key={item.label}
              {...(item.external
                ? { rel: "noreferrer", target: "_blank" }
                : {})}
            >
              {item.label}
              {item.external ? <ArrowUpRight className="h-3 w-3" /> : null}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-20 sm:px-10 md:pt-24 md:pb-28">
        <h1 className="font-bold font-display text-[clamp(3.4rem,11.5vw,11rem)] uppercase leading-[0.88] tracking-[-0.01em]">
          <span className="ink-rise block" style={{ animationDelay: "60ms" }}>
            The <span className="text-[var(--signal)]">easy</span> way
          </span>
          <span className="ink-rise block" style={{ animationDelay: "180ms" }}>
            to shadcn.
          </span>
        </h1>

        <div className="mt-12 grid grid-cols-12 gap-y-8 md:mt-16 md:gap-8">
          <div className="col-span-12 md:col-span-7">
            <p
              className="ink-rise max-w-xl text-balance text-[1.05rem] text-[var(--ink)]/80 leading-[1.6] md:text-[1.15rem]"
              style={{ animationDelay: "320ms" }}
            >
              Hand-stitched wrappers over{" "}
              <a
                className="font-semibold underline decoration-[3px] decoration-[var(--signal)] underline-offset-4"
                href="https://ui.shadcn.com"
                rel="noreferrer"
                target="_blank"
              >
                shadcn/ui
              </a>{" "}
              that swap nested children for flat props. Eighty percent of your
              UI ships with one tag. The other twenty — drop down to the
              primitive. No lock-in. No black box.
            </p>

            <div
              className="ink-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "460ms" }}
            >
              <Link
                className="group inline-flex items-center gap-3 bg-[var(--ink)] px-6 py-3.5 font-semibold text-[12px] text-white uppercase tracking-[0.18em] transition-colors hover:bg-[var(--signal-deep)]"
                href="/docs"
              >
                Read the docs
                <Arrow className="h-3 w-auto transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                className="inline-flex items-center gap-3 border-2 border-[var(--ink)] px-6 py-3 font-semibold text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-[var(--ink)] hover:text-white"
                href="#components"
              >
                Browse components
              </Link>
              <a
                className="ml-1 inline-flex items-center gap-2 font-semibold text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                href={GITHUB_URL}
                rel="noreferrer"
                target="_blank"
              >
                Star on GitHub
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div
            className="ink-rise col-span-12 md:col-span-5"
            style={{ animationDelay: "560ms" }}
          >
            <InstallCard />
            <p className="mt-4 text-right font-semibold text-[10px] text-[var(--muted)] uppercase tracking-[0.26em]">
              Paste into any shadcn-ready repo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function ServiceFacts() {
  const stats = [
    { value: "28", label: "components", note: "and growing" },
    { value: "80/20", label: "by design", note: "no slot abuse" },
    { value: "01", label: "line install", note: "shadcn CLI" },
    { value: "100%", label: "yours", note: "MIT, copy & own" },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-14 sm:px-10 md:py-20">
      <p className="max-w-2xl text-balance text-[1.05rem] text-[var(--ink)]/80 leading-[1.6]">
        A small library on purpose. Each component earns its way in by
        collapsing a recurring shadcn pattern into something you'd type without
        thinking.
      </p>

      <dl className="mt-12 grid grid-cols-2 gap-y-12 border-[var(--ink)]/10 border-t pt-12 md:grid-cols-4 md:gap-y-0">
        {stats.map((s, i) => (
          <div
            className={`relative flex flex-col gap-2.5 md:px-8 ${
              i === 0 ? "md:pl-0" : ""
            } ${i === stats.length - 1 ? "md:pr-0" : ""}`}
            key={s.label}
          >
            {i > 0 && (
              <span
                aria-hidden
                className="absolute top-1 bottom-1 left-0 hidden w-px bg-[var(--ink)]/10 md:block"
              />
            )}
            <dt className="font-display font-semibold text-[clamp(2.8rem,5vw,4.4rem)] leading-none tracking-[-0.01em]">
              {s.value}
            </dt>
            <dd className="font-semibold text-[11px] uppercase tracking-[0.24em]">
              {s.label}
            </dd>
            <dd className="text-[12.5px] text-[var(--muted)] italic">
              {s.note}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Shortcut() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:py-28">
        <div className="grid grid-cols-12 gap-y-8 md:gap-8">
          <div className="col-span-12 md:col-span-8">
            <h2 className="font-bold font-display text-[clamp(2.6rem,7vw,5.6rem)] uppercase leading-[0.9] tracking-[-0.01em]">
              Less wrapping.
              <br />
              More <span className="text-[var(--signal)]">shipping.</span>
            </h2>
          </div>
          <p className="col-span-12 self-end text-balance text-[1.05rem] text-[var(--ink)]/80 leading-[1.65] md:col-span-4">
            The same card. Same behavior. Same primitive underneath. Pull once
            and watch the ladder fold flat.
          </p>
        </div>

        <div className="mt-12">
          <CollapseDemo />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-semibold text-[11px] uppercase tracking-[0.22em]">
          <p>
            <span className="text-[var(--muted)]">Reduction: </span>
            <span className="bg-[var(--signal-deep)] px-1.5 py-0.5 text-white">
              13 → 7 lines
            </span>
            <span className="text-[var(--muted)]"> · same primitives</span>
          </p>
          <p className="text-[var(--muted)]">
            Need the other 20%?{" "}
            <Link
              className="text-[var(--ink)] underline decoration-2 decoration-[var(--signal)] underline-offset-4"
              href="/docs"
            >
              Use the primitive →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function RouteMap() {
  return (
    <section className="relative" id="components">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:py-28">
        <div className="grid grid-cols-12 gap-y-8 md:gap-8">
          <div className="col-span-12 md:col-span-7">
            <h2 className="font-bold font-display text-[clamp(2.6rem,6vw,5rem)] uppercase leading-[0.9] tracking-[-0.01em]">
              Twenty-eight stops.
              <br />
              Four <span className="text-[var(--signal)]">lines.</span>
            </h2>
          </div>
          <p className="col-span-12 self-end text-balance text-[var(--ink)]/80 leading-[1.65] md:col-span-5">
            We don't ship a component until it collapses a real pattern. If
            you've copy-pasted a shadcn structure three times this month, it
            belongs here.
          </p>
        </div>

        {lines.map((line) => (
          <div className="mt-14 grid grid-cols-12 gap-6 md:mt-16" key={line.id}>
            <div className="col-span-12 md:col-span-3">
              <p className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center bg-[var(--ink)] font-bold font-display text-lg text-white">
                  {line.id}
                </span>
                <span className="font-semibold text-[11px] uppercase tracking-[0.26em]">
                  Line {line.id}
                </span>
              </p>
              <p className="mt-3 text-[13px] text-[var(--muted)] italic">
                {line.label}
              </p>
            </div>
            <ol className="col-span-12 md:col-span-9">
              {line.stops.map((stop, i) => {
                const stopNo = `${line.id}${String(i + 1).padStart(2, "0")}`;
                const slug = stop.name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <li
                    className="group grid grid-cols-12 items-baseline gap-4 border-[var(--ink)]/10 border-t py-5 transition-colors last:border-b hover:bg-white"
                    key={stop.name}
                  >
                    <span className="col-span-2 font-mono text-[11px] text-[var(--muted)] tracking-[0.14em] md:col-span-1">
                      {stopNo}
                    </span>
                    <h3 className="col-span-10 font-display font-semibold text-[clamp(1.5rem,2.6vw,2.1rem)] uppercase leading-none tracking-[0.01em] transition-colors group-hover:text-[var(--signal-deep)] md:col-span-4">
                      {stop.name}
                    </h3>
                    <p className="col-span-12 text-[14px] text-[var(--ink)]/75 leading-[1.5] md:col-span-4">
                      {stop.blurb}
                    </p>
                    <Link
                      className="col-span-12 inline-flex items-center justify-between gap-2 border border-[var(--ink)]/20 px-3 py-2 font-mono text-[11px] tracking-[0.1em] transition-colors hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white md:col-span-3"
                      href={`/docs/components/${slug}`}
                    >
                      <span className="truncate">@easy-shadcn/{slug}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function ExpressLine() {
  const features = [
    ["Imperative", "show(), hide(), resolve(value) — from anywhere."],
    ["Promise-based", "await the modal; get the user's answer back."],
    ["UI-agnostic", "Adapters for shadcn (default) and antd v6."],
    ["Zero dependencies", "React ≥ 18. Strictly typed. MIT."],
  ];

  return (
    <section className="on-ink bg-[var(--ink)] text-[var(--platform)]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:py-28">
        <div className="grid grid-cols-12 gap-y-8 md:gap-8">
          <div className="col-span-12 md:col-span-7">
            <h2 className="font-bold font-display text-[clamp(2.6rem,6vw,5rem)] uppercase leading-[0.9] tracking-[-0.01em]">
              Modals, by <span className="text-[var(--signal)]">command.</span>
            </h2>
          </div>
          <p className="col-span-12 self-end text-balance text-[var(--platform)]/75 leading-[1.65] md:col-span-5">
            The registry gives you components to copy. This one is a real npm
            package: an imperative modal manager whose promise settles with
            whatever the user decided.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-10 md:grid-cols-2">
          <div className="border border-white/15">
            <div className="flex items-center justify-between border-white/10 border-b px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em]">
              <span className="flex items-center gap-2">
                <span className="bg-[var(--signal-deep)] px-1.5 py-0.5 font-bold text-white">
                  npm
                </span>
                <span className="text-white/70">
                  @easy-shadcn/command-modal
                </span>
              </span>
              <span className="text-white/40">tsx</span>
            </div>
            <pre className="overflow-x-auto px-4 py-5 font-mono text-[12.5px] leading-[1.75]">
              <code>
                <span className="text-[#8ecafc]">const</span> modal ={" "}
                <span className="text-[#ff6f4f]">useModal</span>
                (ConfirmDialog)
                {"\n\n"}
                <span className="text-white/45">
                  {"// somewhere in a handler:"}
                </span>
                {"\n"}
                <span className="text-[#8ecafc]">const</span> ok ={" "}
                <span className="text-[#8ecafc]">await</span> modal.
                <span className="text-[#ff6f4f]">show</span>({"{ orderId: "}
                <span className="text-[#7ac478]">"A-1042"</span>
                {" })"}
                {"\n"}
                <span className="text-[#8ecafc]">if</span> (ok){" "}
                <span className="text-[#8ecafc]">await</span>{" "}
                <span className="text-[#ff6f4f]">archiveOrder</span>
                (orderId)
              </code>
            </pre>
          </div>

          <div>
            <ul className="divide-y divide-white/10">
              {features.map(([term, def]) => (
                <li
                  className="grid grid-cols-12 items-baseline gap-4 py-4"
                  key={term}
                >
                  <span className="col-span-12 font-display font-semibold text-[1.35rem] uppercase leading-tight tracking-[0.01em] sm:col-span-4">
                    {term}
                  </span>
                  <span className="col-span-12 text-[14px] text-white/70 leading-[1.55] sm:col-span-8">
                    {def}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <code className="border border-white/25 px-4 py-2.5 font-mono text-[12px] text-white">
                $ pnpm add @easy-shadcn/command-modal
              </code>
              <Link
                className="group inline-flex items-center gap-2 font-semibold text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                href="/docs/packages/command-modal"
              >
                Read the docs
                <Arrow className="h-3 w-auto text-[var(--signal)] transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Manifesto() {
  return (
    <section>
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:py-28">
        <h2 className="font-bold font-display text-[clamp(2.4rem,5.5vw,4.4rem)] uppercase leading-[0.92] tracking-[-0.01em]">
          The eighty<span className="text-[var(--signal)]">/</span>twenty
          <br />
          principle, in writing.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {principles.map((p, i) => (
            <article
              className="border border-[var(--ink)]/10 bg-white p-7 md:p-8"
              key={p.no}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-bold font-display text-[2.6rem] text-[var(--signal)] leading-none">
                  {p.no}
                </span>
                <span className="font-semibold text-[10px] text-[var(--muted)] uppercase tracking-[0.26em]">
                  Rule {i + 1} / 3
                </span>
              </div>
              <h3 className="mt-6 font-display font-semibold text-[1.5rem] uppercase leading-[1.05] tracking-[0.01em]">
                {p.title}
              </h3>
              <p className="mt-4 text-[14px] text-[var(--ink)]/70 leading-[1.65]">
                {p.body}
              </p>
            </article>
          ))}
        </div>

        <figure className="mt-14 max-w-3xl">
          <span aria-hidden className="mb-5 block size-3 bg-[var(--signal)]" />
          <blockquote className="text-[1.35rem] text-[var(--ink)]/85 italic leading-[1.45]">
            "Every prop is a debt. We pay it back by leaving the primitive
            unlocked — so the twenty percent of users who need more don't have
            to fight us for it."
          </blockquote>
          <figcaption className="mt-4 font-semibold text-[10px] text-[var(--muted)] uppercase tracking-[0.26em]">
            — The library author, in the house rules
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Departures() {
  const links = [
    { label: "Read the field manual", href: "/docs" },
    { label: "Installation guide", href: "/docs/installation" },
    { label: "Live composite preview", href: "/preview" },
    { label: "Command-modal docs", href: "/docs/packages/command-modal" },
    { label: "Source · MIT · GitHub", href: GITHUB_URL, external: true },
  ];

  return (
    <section className="relative border-[var(--ink)]/10 border-t">
      <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10 md:py-32">
        <h2 className="font-bold font-display text-[clamp(2.5rem,11vw,10.5rem)] uppercase leading-[0.88] tracking-[-0.01em]">
          Stop wrapping.
          <br />
          <span className="inline-flex items-center gap-[0.12em]">
            Start <span className="text-[var(--signal)]">shipping.</span>
          </span>
        </h2>

        <div className="mt-14 grid grid-cols-1 items-start gap-10 md:grid-cols-2">
          <div>
            <InstallCard />
            <p className="mt-4 font-semibold text-[10px] text-[var(--muted)] uppercase tracking-[0.26em]">
              One command. The code lands in your repo.
            </p>
          </div>

          <ul>
            {links.map((link) => (
              <li
                className="group border-[var(--ink)]/10 border-b first:border-t"
                key={link.label}
              >
                <Link
                  className="flex items-center justify-between gap-4 py-4 font-semibold text-[13px] uppercase tracking-[0.18em] transition-colors"
                  href={link.href}
                  {...(link.external
                    ? { rel: "noreferrer", target: "_blank" }
                    : {})}
                >
                  <span>{link.label}</span>
                  <Arrow className="h-3 w-auto text-[var(--ink)]/30 transition-all group-hover:translate-x-1 group-hover:text-[var(--signal-deep)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-[var(--ink)]/10 border-t">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 font-semibold text-[10px] uppercase tracking-[0.24em] sm:px-10 md:flex-row md:items-center">
        <p className="flex items-center gap-3">
          <Logo className="size-5" />
          <span>
            easy<span className="text-[var(--signal)]">/</span>shadcn — the easy
            way to shadcn
          </span>
        </p>
        <p className="text-[var(--muted)]">
          MIT © {new Date().getFullYear()} · set in Barlow
        </p>
      </div>
    </footer>
  );
}
