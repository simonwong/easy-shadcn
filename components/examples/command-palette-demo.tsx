"use client";

import { useState } from "react";
import { CommandPalette } from "@/registry/ui/command-palette";

const Demo = () => {
  const [lastAction, setLastAction] = useState("None");

  return (
    <div className="grid w-full max-w-md gap-3 rounded-xl border p-6">
      <p className="font-medium">Press ⌘K or Ctrl+K</p>
      <p className="text-muted-foreground text-sm">
        Open the palette, search, then press Enter.
      </p>
      <CommandPalette
        items={[
          {
            label: "Create project",
            onSelect: () => setLastAction("Create project"),
            value: "create-project",
          },
          {
            keywords: ["refresh", "pull"],
            label: "Sync workspace",
            onSelect: () => setLastAction("Sync workspace"),
            value: "sync-workspace",
          },
          {
            label: "Open settings",
            onSelect: () => setLastAction("Open settings"),
            value: "open-settings",
          },
        ]}
      />
      <p aria-live="polite" className="text-muted-foreground text-sm">
        Last action: {lastAction}
      </p>
    </div>
  );
};

export default Demo;
