import { ImageResponse } from "next/og";

export const alt = "easy/shadcn — the easy way to shadcn";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#f1ead8";
const INK = "#0c0c0c";
const ACCENT = "#ff4423";
const MUTED = "#6b6450";

const FRAUNCES_NORMAL =
  "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-400-normal.ttf";
const FRAUNCES_ITALIC =
  "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-500-italic.ttf";

async function loadFraunces() {
  const [normal, italic] = await Promise.all([
    fetch(FRAUNCES_NORMAL).then((r) => r.arrayBuffer()),
    fetch(FRAUNCES_ITALIC).then((r) => r.arrayBuffer()),
  ]);
  return [
    {
      name: "Fraunces",
      data: normal,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Fraunces",
      data: italic,
      weight: 500 as const,
      style: "italic" as const,
    },
  ];
}

export default async function OpenGraphImage() {
  const fonts = await loadFraunces();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: CREAM,
        padding: "64px 80px",
        fontFamily: "Fraunces",
        position: "relative",
      }}
    >
      {/* faint dot texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(12,12,12,0.06) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          display: "flex",
        }}
      />

      {/* Top bar: logo + wordmark + tagline */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg
            fill="none"
            height="56"
            viewBox="0 0 32 32"
            width="56"
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
              fontSize: 32,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 700,
              color: INK,
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            <span>easy</span>
            <span style={{ color: MUTED }}>/</span>
            <span>shadcn</span>
          </div>
        </div>
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 18,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: MUTED,
            display: "flex",
          }}
        >
          A field manual for shadcn/ui
        </div>
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
          color: INK,
          fontSize: 168,
          lineHeight: 0.88,
          letterSpacing: "-0.04em",
          fontWeight: 400,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
          <span>the</span>
          <span
            style={{
              color: ACCENT,
              fontStyle: "italic",
              fontWeight: 500,
            }}
          >
            easy
          </span>
          <span>way</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
          <span>to</span>
          <span
            style={{
              fontStyle: "italic",
              fontWeight: 500,
              textDecoration: "underline",
              textDecorationThickness: 4,
              textUnderlineOffset: 12,
            }}
          >
            shadcn.
          </span>
        </div>
      </div>

      {/* Bottom: install command + url */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1,
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
            fontSize: 26,
            color: INK,
            background: "#faf6ec",
            border: `2px solid ${INK}`,
            padding: "14px 22px",
            boxShadow: `8px 8px 0 0 ${ACCENT}`,
          }}
        >
          <span style={{ color: ACCENT }}>$</span>
          <span>pnpm dlx shadcn@latest add</span>
          <span
            style={{
              background: "rgba(255, 68, 35, 0.18)",
              color: "#5a1408",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            @easy-shadcn/card
          </span>
        </div>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            fontWeight: 500,
            color: MUTED,
            letterSpacing: "0.06em",
            display: "flex",
          }}
        >
          easy-shadcn.vercel.app
        </div>
      </div>
    </div>,
    { ...size, fonts }
  );
}
