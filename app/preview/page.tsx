import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { ChatbotScene } from "./features/scenes/chatbot-scene";
import { CommandPaletteScene } from "./features/scenes/command-palette-scene";
import { InboxScene } from "./features/scenes/inbox-scene";
import { SceneFrame } from "./features/scenes/scene-frame";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/preview" },
  description:
    "Three composite scenes — an inbox, a chatbot and a ⌘K palette — each assembled from the easy-shadcn compose layer.",
  title: { absolute: "Preview — easy/shadcn" },
});

const NAV = [
  { anchor: "Inbox", id: "inbox", no: "01" },
  { anchor: "Chatbot", id: "chatbot", no: "02" },
  { anchor: "Palette", id: "palette", no: "03" },
];

export default function PreviewPage() {
  return (
    <div className="w-full">
      <header className="border-border border-b">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="font-semibold text-3xl tracking-tight">
            Composite preview
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The docs show each component alone. This page shows what it feels
            like to compose them — three product surfaces, assembled from the
            same compose layer.
          </p>
          <nav className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {NAV.map((s) => (
              <Link
                className="text-muted-foreground hover:text-foreground hover:underline"
                href={`#${s.id}`}
                key={s.id}
              >
                {s.no} · {s.anchor}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <SceneFrame
        components={[
          "Card",
          "Select · multiple",
          "Input",
          "Textarea",
          "DatePicker",
          "AsyncButton",
          "Modal",
        ]}
        id="inbox"
        no="01"
        subtitle="A mail composer in a single Card: recipient chips, subject, scheduled send, body — sent through one AsyncButton, confirmed by an imperative Modal."
        title="Compose a message"
      >
        <InboxScene />
      </SceneFrame>

      <SceneFrame
        components={["Card", "Select", "Textarea", "AsyncButton"]}
        id="chatbot"
        no="02"
        subtitle="A chat surface where AsyncButton owns the wait. Switch the model live; the next reply prefix reflects it."
        title="Talk to a bot"
      >
        <ChatbotScene />
      </SceneFrame>

      <SceneFrame
        components={[
          "Modal",
          "Tabs · keepMounted",
          "Select · serverSideFilter",
        ]}
        id="palette"
        no="03"
        subtitle="⌘K, but composed. A Modal hosts Tabs hosting server-search Selects — each tab keeps its query when you switch."
        title="Open the palette"
      >
        <CommandPaletteScene />
      </SceneFrame>
    </div>
  );
}
