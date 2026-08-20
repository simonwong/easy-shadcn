import { ImageResponse } from "next/og";

export const alt = "easy/shadcn — the easy way to shadcn";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#FAF9F7";
const INK = "#111111";
const ACCENT = "#EB5436";
const MUTED = "#5C5C54";

const BARLOW_SEMI_CONDENSED_700 =
  "https://cdn.jsdelivr.net/fontsource/fonts/barlow-semi-condensed@latest/latin-700-normal.ttf";

async function loadBarlowSemiCondensed() {
  const data = await fetch(BARLOW_SEMI_CONDENSED_700).then((response) =>
    response.arrayBuffer()
  );

  return [
    {
      name: "Barlow Semi Condensed",
      data,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}

export default async function OpenGraphImage() {
  const fonts = await loadBarlowSemiCondensed();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BACKGROUND,
        color: INK,
        padding: "64px 72px 66px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg
              fill="none"
              height="46"
              viewBox="0 0 32 32"
              width="46"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 24 Q 8 18, 14 13"
                stroke={ACCENT}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
              <path
                d="M15 26 Q 19 16, 26 8"
                stroke={INK}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </svg>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontFamily: "Barlow Semi Condensed",
                fontSize: 31,
                fontWeight: 700,
                letterSpacing: "0.025em",
                lineHeight: 1,
              }}
            >
              <span>EASY</span>
              <span style={{ color: ACCENT }}>/</span>
              <span>SHADCN</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              color: MUTED,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.13em",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            COMPONENT REGISTRY FOR SHADCN/UI
          </div>
        </div>
        <div
          style={{
            display: "flex",
            height: 2,
            width: "100%",
            background: INK,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          fontFamily: "Barlow Semi Condensed",
          fontSize: 132,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 0.82,
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "flex" }}>
          <span>THE&nbsp;</span>
          <span style={{ color: ACCENT }}>EASY</span>
          <span>&nbsp;WAY</span>
        </div>
        <div style={{ display: "flex" }}>TO SHADCN.</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 21,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: ACCENT, fontWeight: 700 }}>$</span>
          <span>pnpm dlx shadcn@latest add @easy-shadcn/card</span>
        </div>
        <div
          style={{
            display: "flex",
            color: MUTED,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 18,
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          easy-shadcn.vercel.app
        </div>
      </div>
    </div>,
    { ...size, fonts }
  );
}
