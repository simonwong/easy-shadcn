"use client";

import { useState } from "react";
import { Menubar } from "@/registry/ui/menubar";

export default function MenubarDemo() {
  const [message, setMessage] = useState("Untitled document");

  return (
    <div className="w-full max-w-md space-y-3">
      <Menubar
        items={[
          {
            key: "file",
            trigger: "File",
            items: [
              {
                key: "new",
                content: "New document",
                onClick: () => setMessage("New document created"),
              },
              {
                key: "save",
                content: "Save",
                onClick: () => setMessage("Document saved"),
              },
            ],
          },
          {
            key: "edit",
            trigger: "Edit",
            items: [
              {
                key: "undo",
                content: "Undo",
                onClick: () => setMessage("Last change undone"),
              },
              { key: "redo", content: "Redo", disabled: true },
            ],
          },
        ]}
      />
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {message}
      </p>
    </div>
  );
}
