import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";

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

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const GITHUB_URL = "https://github.com/simonwong/easy-shadcn";

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
      {/* the "easy" swoosh — accent stroke, lifting upward */}
      <path d="M4 24 Q 8 18, 14 13" stroke="var(--accent)" strokeWidth="4" />
      {/* the shadcn slash — ink stroke, parallel lift */}
      <path d="M15 26 Q 19 16, 26 8" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

const components = [
  {
    no: "01",
    name: "Card",
    blurb: "Flat slots for title, description, action and footer.",
    install: "@easy-shadcn/card",
  },
  {
    no: "02",
    name: "Tabs",
    blurb: "Items array in. Tabs out. Heterogeneous? Use the primitive.",
    install: "@easy-shadcn/tabs",
  },
  {
    no: "03",
    name: "Async Button",
    blurb: "Returns a Promise? It handles loading, icons and anti-flash.",
    install: "@easy-shadcn/async-button",
  },
  {
    no: "04",
    name: "Modal",
    blurb: "Imperative alert & confirm, ready for command palettes.",
    install: "@easy-shadcn/modal",
  },
  {
    no: "05",
    name: "Calendar",
    blurb: "Three-view month/year navigation. No more native dropdowns.",
    install: "@easy-shadcn/calendar",
  },
  {
    no: "06",
    name: "Date Picker",
    blurb: "Single, multiple, range, inline-input — one component.",
    install: "@easy-shadcn/date-picker",
  },
  {
    no: "07",
    name: "Accordion",
    blurb: "Items array in. Expandable panels out. No nested triple per row.",
    install: "@easy-shadcn/accordion",
  },
  {
    no: "08",
    name: "Breadcrumb",
    blurb: "Trail of items in. Auto current page and collapsing ellipsis out.",
    install: "@easy-shadcn/breadcrumb",
  },
  {
    no: "09",
    name: "Tooltip",
    blurb: "Wrap an element, pass content. Its own provider — zero setup.",
    install: "@easy-shadcn/tooltip",
  },
  {
    no: "10",
    name: "Radio Group",
    blurb:
      "Options array in. Wired-up radio rows out. Labels and a11y included.",
    install: "@easy-shadcn/radio-group",
  },
];

const principles = [
  {
    no: "I",
    title: "Flat props,\nnot nested children.",
    body: "One prop per slot. No more <CardHeader><CardTitle> ladders. Eighty percent of layouts ship with one tag.",
  },
  {
    no: "II",
    title: "Composition\nstays primitive.",
    body: "Compose layer never grows render props or slot objects. Need the other twenty? Drop down to components/ui/* — the door is unlocked.",
  },
  {
    no: "III",
    title: "Your code,\nyour repo.",
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
      className={`${fraunces.variable} landing-root relative min-h-screen w-full overflow-x-clip antialiased`}
    >
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is a static object we control
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <Masthead />
      <Hero />
      <Ticker />
      <ByTheNumbers />
      <BeforeAfter />
      <ComponentsIndex />
      <Manifesto />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Masthead() {
  return (
    <header className="relative z-10 border-[var(--rule)] border-b">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] sm:px-10">
        <Link className="flex items-center gap-2" href="/">
          <Logo className="size-6" />
          <span className="font-semibold text-[13px] normal-case tracking-[0.04em]">
            easy<span className="text-[var(--muted)]">/</span>shadcn
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link className="underline-offset-4 hover:underline" href="/docs">
            Docs ↗
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/preview">
            Preview ↗
          </Link>
          <a
            className="underline-offset-4 hover:underline"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative">
      {/* Decorative left rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 bottom-0 left-6 hidden w-px bg-[var(--rule)]/40 md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-6 bottom-0 hidden w-px bg-[var(--rule)]/40 md:block"
      />

      <div className="mx-auto max-w-[1400px] px-6 pt-10 pb-16 sm:px-10 md:pt-16 md:pb-24">
        {/* Eyebrow row */}
        <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.22em] md:text-right">
          ✦ A field manual for shadcn/ui ✦
        </div>

        {/* Headline */}
        <h1 className="mt-8 font-display font-light text-[clamp(3.2rem,11vw,11.5rem)] leading-[0.86] tracking-[-0.04em] md:mt-12">
          <span className="ink-rise block" style={{ animationDelay: "60ms" }}>
            the{" "}
            <em
              className="relative inline-block font-medium text-[var(--accent)] italic"
              style={{ fontFeatureSettings: "'ss01'" }}
            >
              easy
              <svg
                aria-hidden
                className="absolute -bottom-1 left-0 h-3 w-full text-[var(--accent)]"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 200 12"
              >
                <path
                  d="M2 8 C 60 2, 140 12, 198 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.2"
                />
              </svg>
            </em>{" "}
            way
          </span>
          <span className="ink-rise block" style={{ animationDelay: "180ms" }}>
            to{" "}
            <span className="font-display font-normal italic underline decoration-2 underline-offset-[0.12em]">
              shadcn.
            </span>
          </span>
        </h1>

        {/* Sub & meta grid */}
        <div className="mt-10 grid grid-cols-12 gap-6 md:mt-14">
          <div className="col-span-12 md:col-span-7">
            <p
              className="ink-rise max-w-xl text-balance text-[1.05rem] text-[var(--ink)]/80 leading-[1.55] md:text-[1.15rem]"
              style={{ animationDelay: "320ms" }}
            >
              Hand-stitched wrappers over{" "}
              <a
                className="font-medium underline underline-offset-4"
                href="https://ui.shadcn.com"
                rel="noreferrer"
                target="_blank"
              >
                shadcn/ui
              </a>{" "}
              that swap nested children for{" "}
              <span className="font-display italic">flat props</span>. Eighty
              percent of your UI ships with one tag. The other twenty — drop
              down to the primitive. No lock-in. No black box.
            </p>

            <div
              className="ink-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "460ms" }}
            >
              <Link
                className="group inline-flex items-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[11px] text-[var(--paper)] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5"
                href="/docs"
              >
                Read the field manual
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                className="group inline-flex items-center gap-2 border border-[var(--ink)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                href="#components"
              >
                Browse components
              </Link>
              <a
                className="ml-1 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                href={GITHUB_URL}
                rel="noreferrer"
                target="_blank"
              >
                ★ Star on GitHub
              </a>
            </div>
          </div>

          {/* Terminal card */}
          <div
            className="ink-rise col-span-12 md:col-span-5"
            style={{ animationDelay: "560ms" }}
          >
            <div className="relative border border-[var(--ink)] bg-[var(--paper)] shadow-[8px_8px_0_0_var(--ink)]">
              <div className="flex items-center justify-between border-[var(--ink)] border-b bg-[var(--ink)] px-3 py-2 font-mono text-[10px] text-[var(--paper)] uppercase tracking-[0.22em]">
                <span className="flex items-center gap-1.5">
                  <i className="inline-block size-2 rounded-full bg-[var(--accent)]" />
                  <i className="inline-block size-2 rounded-full bg-[#f5b400]" />
                  <i className="inline-block size-2 rounded-full bg-[#3fc671]" />
                </span>
                <span>~/your-app · zsh</span>
              </div>
              <pre className="overflow-x-auto px-4 py-5 font-mono text-[13px] leading-[1.7]">
                <code>
                  <span className="text-[var(--muted)]">
                    # 1. configure once
                  </span>
                  {"\n"}
                  <span className="text-[var(--accent)]">$</span> pnpm dlx
                  shadcn@latest init
                  {"\n\n"}
                  <span className="text-[var(--muted)]">
                    # 2. install any component
                  </span>
                  {"\n"}
                  <span className="text-[var(--accent)]">$</span> pnpm dlx
                  shadcn@latest add{" "}
                  <span className="rounded-sm bg-[var(--accent)]/15 px-1 text-[var(--accent-ink)]">
                    @easy-shadcn/card
                  </span>
                  {"\n\n"}
                  <span className="text-[var(--muted)]">
                    # 3. ship. it's yours now.
                  </span>
                  {"\n"}
                  <span className="text-[var(--accent)]">$</span>{" "}
                  <span className="caret border-[var(--ink)] border-r-2 pl-1">
                    {" "}
                  </span>
                </code>
              </pre>
            </div>
            <p className="mt-3 text-right font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.22em]">
              ↑ paste into any shadcn-ready repo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Ticker() {
  const words = [
    "Flat props",
    "Zero ceremony",
    "Owned by you",
    "Strictly typed",
    "MIT licensed",
    "Eighty / twenty by design",
    "shadcn-native",
    "Tree-shakable",
    "No render-prop carnival",
  ];
  const sequence = [
    ...words.map((word, i) => ({ word, key: `a-${i}-${word}` })),
    ...words.map((word, i) => ({ word, key: `b-${i}-${word}` })),
  ];

  return (
    <div className="relative overflow-hidden border-[var(--rule)] border-y bg-[var(--ink)] text-[var(--paper)]">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap py-4 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] italic">
        {sequence.map((item) => (
          <span className="flex items-center gap-10" key={item.key}>
            <span>{item.word}</span>
            <span aria-hidden className="text-[var(--accent)]">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */

function ByTheNumbers() {
  const stats = [
    { value: "10", label: "components", note: "and growing" },
    { value: "80/20", label: "by design", note: "no slot abuse" },
    { value: "01", label: "line install", note: "shadcn CLI" },
    { value: "100%", label: "yours", note: "MIT, copy & own" },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 md:py-24">
      <div className="grid grid-cols-12 gap-8 border-[var(--rule)] border-b pb-6">
        <h2 className="col-span-12 font-mono text-[11px] uppercase tracking-[0.28em] md:col-span-3">
          ░░ By the numbers
        </h2>
        <p className="col-span-12 max-w-2xl text-balance text-[1rem] text-[var(--ink)]/80 leading-[1.6] md:col-span-9">
          A small library on purpose. Each component earns its way in by
          collapsing a recurring shadcn pattern into something you'd type
          without thinking.
        </p>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-y-0">
        {stats.map((s, i) => (
          <div
            className={`relative flex flex-col gap-2 md:px-8 ${
              i === 0 ? "md:pl-0" : ""
            } ${i === stats.length - 1 ? "md:pr-0" : ""}`}
            key={s.label}
          >
            {i > 0 && (
              <span
                aria-hidden
                className="absolute top-1 bottom-1 left-0 hidden w-px bg-[var(--rule)]/40 md:block"
              />
            )}
            <dt className="font-display text-[clamp(3rem,5.5vw,4.8rem)] leading-none tracking-[-0.04em]">
              {s.value}
            </dt>
            <dd className="font-mono text-[11px] uppercase tracking-[0.22em]">
              {s.label}
            </dd>
            <dd className="text-[12px] text-[var(--muted)] italic">{s.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function BeforeAfter() {
  return (
    <section className="relative border-[var(--rule)] border-t bg-[var(--paper)]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:py-28">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-8">
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.28em]">
              ❉ Section II · The Demonstration
            </p>
            <h2 className="mt-4 font-display font-light text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.95] tracking-[-0.03em]">
              Less <em className="text-[var(--accent)] italic">wrapping.</em>
              <br />
              More shipping.
            </h2>
          </div>
          <p className="col-span-12 self-end text-balance text-[1rem] text-[var(--ink)]/80 leading-[1.65] md:col-span-4">
            The same card. Same behavior. Same primitive underneath. One reads
            like a poem. The other reads like assembly instructions for a
            bookshelf.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <CodePanel
            badge="Before"
            label="shadcn/ui · raw"
            lineCount={13}
            tone="muted"
          >
            <Line n={1}>
              <Tag>{"<Card>"}</Tag>
            </Line>
            <Line indent={1} n={2}>
              <Tag>{"<CardHeader>"}</Tag>
            </Line>
            <Line indent={2} n={3}>
              <Tag>{"<CardTitle>"}</Tag>New invoice
              <Tag>{"</CardTitle>"}</Tag>
            </Line>
            <Line indent={2} n={4}>
              <Tag>{"<CardDescription>"}</Tag>Due in 14 days.
              <Tag>{"</CardDescription>"}</Tag>
            </Line>
            <Line indent={2} n={5}>
              <Tag>{"<CardAction>"}</Tag>
            </Line>
            <Line indent={3} n={6}>
              <Tag>{"<Button "}</Tag>
              <Prop>variant</Prop>=<Str>"ghost"</Str>
              <Tag>{">"}</Tag>Edit<Tag>{"</Button>"}</Tag>
            </Line>
            <Line indent={2} n={7}>
              <Tag>{"</CardAction>"}</Tag>
            </Line>
            <Line indent={1} n={8}>
              <Tag>{"</CardHeader>"}</Tag>
            </Line>
            <Line indent={1} n={9}>
              <Tag>{"<CardContent>"}</Tag>Net 30 · $1,240.00
              <Tag>{"</CardContent>"}</Tag>
            </Line>
            <Line indent={1} n={10}>
              <Tag>{"<CardFooter>"}</Tag>
            </Line>
            <Line indent={2} n={11}>
              <Tag>{"<Button>"}</Tag>Send<Tag>{"</Button>"}</Tag>
            </Line>
            <Line indent={1} n={12}>
              <Tag>{"</CardFooter>"}</Tag>
            </Line>
            <Line n={13}>
              <Tag>{"</Card>"}</Tag>
            </Line>
          </CodePanel>

          <CodePanel
            badge="After"
            label="easy-shadcn · composed"
            lineCount={7}
            tone="bright"
          >
            <Line n={1}>
              <Tag>{"<Card"}</Tag>
            </Line>
            <Line indent={1} n={2}>
              <Prop>title</Prop>=<Str>"New invoice"</Str>
            </Line>
            <Line indent={1} n={3}>
              <Prop>description</Prop>=<Str>"Due in 14 days."</Str>
            </Line>
            <Line indent={1} n={4}>
              <Prop>action</Prop>={"{"}
              <Tag>{"<Button "}</Tag>
              <Prop>variant</Prop>=<Str>"ghost"</Str>
              <Tag>{">"}</Tag>Edit<Tag>{"</Button>"}</Tag>
              {"}"}
            </Line>
            <Line indent={1} n={5}>
              <Prop>footer</Prop>={"{"}
              <Tag>{"<Button>"}</Tag>Send<Tag>{"</Button>"}</Tag>
              {"}"}
            </Line>
            <Line n={6}>
              <Tag>{">"}</Tag>Net 30 · $1,240.00<Tag>{"</Card>"}</Tag>
            </Line>
            <Line n={7}>
              <span className="text-[var(--muted)]">{/* ✓ done */}</span>
            </Line>
          </CodePanel>
        </div>

        <div className="mt-10 grid grid-cols-12 items-end gap-6 border-[var(--rule)] border-t pt-6 font-mono text-[11px] uppercase tracking-[0.22em]">
          <p className="col-span-12 md:col-span-6">
            <span className="text-[var(--muted)]">Reduction: </span>
            <span className="font-bold text-[var(--accent)]">13 → 7 lines</span>
            <span className="text-[var(--muted)]"> · same primitives</span>
          </p>
          <p className="col-span-12 text-[var(--muted)] md:col-span-6 md:text-right">
            Need the other 20%?{" "}
            <Link className="underline" href="/docs">
              Use the primitive →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function CodePanel({
  badge,
  tone,
  label,
  lineCount,
  children,
}: {
  badge: string;
  tone: "muted" | "bright";
  label: string;
  lineCount: number;
  children: React.ReactNode;
}) {
  const isBright = tone === "bright";
  return (
    <figure
      className={`relative border border-[var(--ink)] ${
        isBright
          ? "bg-[var(--ink)] text-[var(--paper)] shadow-[10px_10px_0_0_var(--accent)]"
          : "bg-[var(--bg)] text-[var(--ink)]/80 shadow-[6px_6px_0_0_var(--ink)]"
      }`}
    >
      <figcaption
        className={`flex items-center justify-between border-b px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] ${
          isBright
            ? "border-[var(--paper)]/15 bg-[var(--ink)] text-[var(--paper)]"
            : "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
        }`}
      >
        <span className="flex items-center gap-2">
          <span
            className={`px-1.5 py-0.5 ${
              isBright
                ? "bg-[var(--accent)] text-[var(--paper)]"
                : "bg-[var(--paper)] text-[var(--ink)]"
            }`}
          >
            {badge}
          </span>
          <span>{label}</span>
        </span>
        <span>{lineCount} ln</span>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-5 font-mono text-[12.5px] leading-[1.75]">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

function Line({
  n,
  indent = 0,
  children,
}: {
  n: number;
  indent?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <span className="mr-4 w-5 select-none text-right opacity-40">{n}</span>
      <span>
        {"  ".repeat(indent)}
        {children}
      </span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--accent)]">{children}</span>;
}
function Prop({ children }: { children: React.ReactNode }) {
  return <span className="text-[#f5b400]">{children}</span>;
}
function Str({ children }: { children: React.ReactNode }) {
  return <span className="text-[#7ac478]">{children}</span>;
}

/* ────────────────────────────────────────────────────────────── */

function ComponentsIndex() {
  return (
    <section className="relative" id="components">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:py-28">
        <div className="grid grid-cols-12 gap-8 border-[var(--rule)] border-b pb-8">
          <div className="col-span-12 md:col-span-7">
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.28em]">
              ✦ Section III · The Catalogue
            </p>
            <h2 className="mt-4 font-display font-light text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em]">
              Ten pieces.
              <br />
              <em className="text-[var(--accent)] italic">Each earned its</em>
              {"  "}
              <span className="italic underline decoration-2 underline-offset-[0.1em]">
                place.
              </span>
            </h2>
          </div>
          <p className="col-span-12 self-end text-balance text-[var(--ink)]/80 leading-[1.65] md:col-span-5">
            We don't ship a component until it collapses a real pattern. If
            you've copy-pasted a shadcn structure three times this month, it
            belongs here.
          </p>
        </div>

        <ol className="mt-10 divide-y divide-[var(--rule)]/30">
          {components.map((c) => (
            <li
              className="group grid grid-cols-12 items-baseline gap-4 py-6 transition-colors hover:bg-[var(--paper)]"
              key={c.name}
            >
              <span className="col-span-2 font-mono text-[12px] text-[var(--muted)] tracking-[0.22em] md:col-span-1">
                {c.no}
              </span>
              <h3 className="col-span-10 font-display font-medium text-[clamp(1.6rem,3vw,2.4rem)] leading-tight tracking-[-0.02em] md:col-span-4">
                {c.name}
              </h3>
              <p className="col-span-12 text-[15px] text-[var(--ink)]/75 leading-[1.5] md:col-span-4">
                {c.blurb}
              </p>
              <a
                className="col-span-12 inline-flex items-center justify-between gap-2 border border-[var(--ink)] px-3 py-2 font-mono text-[11px] tracking-[0.18em] transition-colors group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)] md:col-span-3"
                href={`/docs/components/${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className="truncate">{c.install}</span>
                <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Manifesto() {
  return (
    <section className="border-[var(--rule)] border-y bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 md:py-28">
        <p className="font-mono text-[11px] text-[var(--paper)]/60 uppercase tracking-[0.28em]">
          ✦ The Manifesto · Three rules we won't break
        </p>
        <h2 className="mt-4 font-display font-light text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[0.98] tracking-[-0.03em]">
          The <em className="text-[var(--accent)] italic">eighty / twenty</em>{" "}
          <br />
          principle, in writing.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10">
          {principles.map((p, i) => (
            <article
              className="relative border border-[var(--paper)]/20 bg-[var(--ink)] p-6 md:p-7"
              key={p.no}
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 h-1.5 w-12 bg-[var(--accent)]"
              />
              <div className="flex items-baseline justify-between">
                <span className="font-display font-light text-[3rem] text-[var(--accent)] italic leading-none">
                  {p.no}
                </span>
                <span className="font-mono text-[10px] text-[var(--paper)]/40 uppercase tracking-[0.28em]">
                  Rule {i + 1} / 3
                </span>
              </div>
              <h3 className="mt-6 whitespace-pre-line font-display font-light text-[1.7rem] leading-[1.05] tracking-[-0.02em]">
                {p.title}
              </h3>
              <p className="mt-5 text-[14.5px] text-[var(--paper)]/70 leading-[1.65]">
                {p.body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-2xl font-display text-[1.4rem] text-[var(--paper)]/70 italic leading-[1.4]">
          "Every prop is a debt. We pay it back by leaving the primitive
          unlocked — so the twenty percent of users who need more don't have to
          fight us for it."
          <span className="mt-2 block font-mono text-[10px] text-[var(--paper)]/40 uppercase not-italic tracking-[0.28em]">
            ─ The library author, in the AGENTS.md
          </span>
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10 md:py-36">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12">
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.28em]">
              ✦ Last Page · Take it home
            </p>
            <h2 className="mt-6 font-display font-light text-[clamp(3.4rem,12vw,12rem)] leading-[0.85] tracking-[-0.04em]">
              Stop <em className="text-[var(--accent)] italic">wrapping.</em>
              <br />
              <span className="italic">Start </span>
              <span className="font-medium underline decoration-2 underline-offset-[0.1em]">
                shipping.
              </span>
            </h2>
          </div>

          <div className="col-span-12 mt-8 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div className="border border-[var(--ink)] bg-[var(--paper)] shadow-[10px_10px_0_0_var(--accent)]">
              <div className="flex items-center justify-between border-[var(--ink)] border-b bg-[var(--ink)] px-3 py-2 font-mono text-[10px] text-[var(--paper)] uppercase tracking-[0.22em]">
                <span>$ install</span>
                <span className="text-[var(--accent)]">copy ↗</span>
              </div>
              <pre className="overflow-x-auto px-5 py-6 font-mono text-[15px] leading-[1.6]">
                <code>
                  <span className="text-[var(--accent)]">$</span> pnpm dlx
                  shadcn@latest add{" "}
                  <span className="rounded-sm bg-[var(--accent)]/15 px-1 text-[var(--accent-ink)]">
                    @easy-shadcn/card
                  </span>
                </code>
              </pre>
            </div>

            <ul className="space-y-3 font-mono text-[12px] uppercase tracking-[0.16em]">
              <li className="flex items-center gap-3">
                <span className="size-1.5 bg-[var(--accent)]" />
                <Link
                  className="underline-offset-4 hover:underline"
                  href="/docs"
                >
                  Read the field manual
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 bg-[var(--accent)]" />
                <Link
                  className="underline-offset-4 hover:underline"
                  href="/docs/installation"
                >
                  Installation guide
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 bg-[var(--accent)]" />
                <Link
                  className="underline-offset-4 hover:underline"
                  href="/preview"
                >
                  Live composite preview
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <span className="size-1.5 bg-[var(--accent)]" />
                <a
                  className="underline-offset-4 hover:underline"
                  href={GITHUB_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  Source · MIT · GitHub ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-[var(--rule)] border-t">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 font-mono text-[10px] uppercase tracking-[0.22em] sm:px-10 md:flex-row md:items-center">
        <p className="flex items-center gap-3">
          <Logo className="size-5" />
          <span>
            easy<span className="text-[var(--muted)]">/</span>shadcn — A field
            manual for shipping UI.
          </span>
        </p>
        <p className="text-[var(--muted)]">
          MIT © {new Date().getFullYear()} · printed on the web, locally
        </p>
      </div>
    </footer>
  );
}
