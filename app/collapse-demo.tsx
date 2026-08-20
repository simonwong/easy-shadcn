"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Token = { t: string; c?: "tag" | "prop" | "str" | "mut" };
type Row = { n: number; indent: number; tokens: Token[] };
type Phase = "before" | "after";

const tag = (t: string): Token => ({ t, c: "tag" });
const prop = (t: string): Token => ({ t, c: "prop" });
const str = (t: string): Token => ({ t, c: "str" });
const mut = (t: string): Token => ({ t, c: "mut" });
const txt = (t: string): Token => ({ t });

const beforeRows: Row[] = [
  { n: 1, indent: 0, tokens: [tag("<Card>")] },
  { n: 2, indent: 1, tokens: [tag("<CardHeader>")] },
  {
    n: 3,
    indent: 2,
    tokens: [tag("<CardTitle>"), txt("New invoice"), tag("</CardTitle>")],
  },
  {
    n: 4,
    indent: 2,
    tokens: [
      tag("<CardDescription>"),
      txt("Due in 14 days."),
      tag("</CardDescription>"),
    ],
  },
  { n: 5, indent: 2, tokens: [tag("<CardAction>")] },
  {
    n: 6,
    indent: 3,
    tokens: [
      tag("<Button "),
      prop("variant"),
      txt("="),
      str('"ghost"'),
      tag(">"),
      txt("Edit"),
      tag("</Button>"),
    ],
  },
  { n: 7, indent: 2, tokens: [tag("</CardAction>")] },
  { n: 8, indent: 1, tokens: [tag("</CardHeader>")] },
  {
    n: 9,
    indent: 1,
    tokens: [
      tag("<CardContent>"),
      txt("Net 30 · $1,240.00"),
      tag("</CardContent>"),
    ],
  },
  { n: 10, indent: 1, tokens: [tag("<CardFooter>")] },
  {
    n: 11,
    indent: 2,
    tokens: [tag("<Button>"), txt("Send"), tag("</Button>")],
  },
  { n: 12, indent: 1, tokens: [tag("</CardFooter>")] },
  { n: 13, indent: 0, tokens: [tag("</Card>")] },
];

const afterRows: Row[] = [
  { n: 1, indent: 0, tokens: [tag("<Card")] },
  { n: 2, indent: 1, tokens: [prop("title"), txt("="), str('"New invoice"')] },
  {
    n: 3,
    indent: 1,
    tokens: [prop("description"), txt("="), str('"Due in 14 days."')],
  },
  {
    n: 4,
    indent: 1,
    tokens: [
      prop("action"),
      txt("={"),
      tag("<Button "),
      prop("variant"),
      txt("="),
      str('"ghost"'),
      tag(">"),
      txt("Edit"),
      tag("</Button>"),
      txt("}"),
    ],
  },
  {
    n: 5,
    indent: 1,
    tokens: [
      prop("footer"),
      txt("={"),
      tag("<Button>"),
      txt("Send"),
      tag("</Button>"),
      txt("}"),
    ],
  },
  {
    n: 6,
    indent: 0,
    tokens: [tag(">"), txt("Net 30 · $1,240.00"), tag("</Card>")],
  },
  { n: 7, indent: 0, tokens: [mut("// ✓ done")] },
];

const tokenColor: Record<NonNullable<Token["c"]>, string> = {
  tag: "#ff6f4f",
  prop: "#8ecafc",
  str: "#7ac478",
  mut: "rgba(244, 244, 240, 0.45)",
};

function CodeLine({ row }: { row: Row }) {
  const seen = new Map<string, number>();
  return (
    <span>
      {"  ".repeat(row.indent)}
      {row.tokens.map((token) => {
        const base = `${token.c ?? "txt"}:${token.t}`;
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return (
          <span
            key={`${base}#${count}`}
            style={token.c ? { color: tokenColor[token.c] } : undefined}
          >
            {token.t}
          </span>
        );
      })}
    </span>
  );
}

export function CollapseDemo() {
  const [phase, setPhase] = useState<Phase>("before");
  const [autoPlayed, setAutoPlayed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inView = useInView(rootRef, { once: true, margin: "-20% 0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (inView && !autoPlayed) {
      timerRef.current = setTimeout(
        () => {
          timerRef.current = null;
          setPhase("after");
          setAutoPlayed(true);
        },
        reduceMotion ? 100 : 1400
      );
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [inView, autoPlayed, reduceMotion]);

  const selectPhase = (nextPhase: Phase) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAutoPlayed(true);
    setPhase(nextPhase);
  };

  const replay = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAutoPlayed(true);
    setPhase("before");
    timerRef.current = setTimeout(
      () => {
        timerRef.current = null;
        setPhase("after");
      },
      reduceMotion ? 100 : 900
    );
  };

  const rows = phase === "before" ? beforeRows : afterRows;
  const duration = reduceMotion ? 0.01 : 1;

  return (
    <div
      className="on-ink border border-[var(--ink)] bg-[var(--ink)] text-[var(--platform)]"
      ref={rootRef}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-[var(--platform)]/15 border-b px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em]">
        <span className="text-[var(--platform)]/60">
          card.tsx ·{" "}
          {phase === "before" ? "raw shadcn/ui · 13 ln" : "easy-shadcn · 7 ln"}
        </span>
        <span className="flex items-center gap-1">
          <button
            aria-pressed={phase === "before"}
            className={`px-2.5 py-1 transition-colors ${
              phase === "before"
                ? "bg-[var(--platform)] text-[var(--ink)]"
                : "text-[var(--platform)]/60 hover:text-[var(--platform)]"
            }`}
            onClick={() => selectPhase("before")}
            type="button"
          >
            Primitive
          </button>
          <button
            aria-pressed={phase === "after"}
            className={`px-2.5 py-1 transition-colors ${
              phase === "after"
                ? "bg-[var(--signal-deep)] text-white"
                : "text-[var(--platform)]/60 hover:text-[var(--platform)]"
            }`}
            onClick={() => selectPhase("after")}
            type="button"
          >
            Compose
          </button>
          <button
            className="ml-2 inline-flex items-center gap-1.5 text-[var(--platform)]/60 transition-colors hover:text-[var(--signal)]"
            onClick={replay}
            type="button"
          >
            <svg
              aria-hidden
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12a9 9 0 1 0 2.6-6.3M3 4v5h5"
                stroke="currentColor"
                strokeLinecap="square"
                strokeWidth="2.4"
              />
            </svg>
            Replay
          </button>
        </span>
      </div>
      <motion.div
        animate={{ height: phase === "before" ? 330 : 200 }}
        className="overflow-x-auto overflow-y-hidden px-4 py-5 font-mono text-[12.5px] leading-[1.75]"
        initial={false}
        transition={{ duration: 0.9 * duration, ease: EASE }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            animate="show"
            exit="exit"
            initial="enter"
            key={phase}
            variants={{
              show: { transition: { staggerChildren: 0.05 } },
              exit: {
                transition: { staggerChildren: 0.032, staggerDirection: -1 },
              },
            }}
          >
            {rows.map((row) => (
              <motion.div
                className="flex overflow-hidden whitespace-pre"
                key={row.n}
                variants={{
                  enter: { height: 0, opacity: 0, y: 10 },
                  show: {
                    height: "auto",
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.42 * duration, ease: EASE },
                  },
                  exit: {
                    height: 0,
                    opacity: 0,
                    transition: { duration: 0.26 * duration, ease: EASE },
                  },
                }}
              >
                <span className="mr-4 w-5 select-none text-right text-[var(--platform)]/35">
                  {row.n}
                </span>
                <CodeLine row={row} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
