"use client";

import { useState } from "react";
import { Menubar } from "@/registry/ui/menubar";

export default function MenubarSettingsDemo() {
  const [ruler, setRuler] = useState(true);
  const [zoom, setZoom] = useState("100");
  const [message, setMessage] = useState(
    "Choose an export format or adjust the view."
  );

  return (
    <div className="w-full max-w-md space-y-3">
      <Menubar
        aria-label="Editor settings"
        items={[
          {
            key: "file",
            trigger: "File",
            items: [
              {
                key: "document",
                type: "group",
                content: "Document",
                items: [
                  {
                    key: "save",
                    content: "Save",
                    shortcut: "⌘S",
                    onClick: () => setMessage("Document saved"),
                  },
                ],
              },
              { key: "divider", type: "separator" },
              {
                key: "export",
                type: "submenu",
                content: "Export",
                items: [
                  {
                    key: "pdf",
                    content: "PDF",
                    onClick: () => setMessage("PDF export requested"),
                  },
                  {
                    key: "markdown",
                    content: "Markdown",
                    onClick: () => setMessage("Markdown export requested"),
                  },
                ],
              },
              {
                key: "delete",
                content: "Delete document",
                variant: "destructive",
                onClick: () => setMessage("Document deleted in this demo"),
              },
            ],
          },
          {
            key: "view",
            trigger: "View",
            items: [
              {
                key: "ruler",
                type: "checkbox",
                content: "Show ruler",
                checked: ruler,
                onCheckedChange: setRuler,
              },
              { key: "divider", type: "separator" },
              {
                key: "zoom",
                type: "radio-group",
                content: "Zoom",
                value: zoom,
                onValueChange: setZoom,
                items: [
                  { value: "75", content: "75%" },
                  { value: "100", content: "100%" },
                  { value: "125", content: "125%" },
                ],
              },
            ],
          },
        ]}
      />
      <div
        aria-live="polite"
        className="space-y-1 text-muted-foreground text-sm"
      >
        <p>
          Ruler {ruler ? "visible" : "hidden"} · Zoom {zoom}%
        </p>
        <p>{message}</p>
      </div>
    </div>
  );
}
