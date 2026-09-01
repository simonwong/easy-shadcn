"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/registry/ui/command-palette";

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const Demo = () => {
  const [lastAction, setLastAction] = useState("None");

  return (
    <div className="grid w-full max-w-md gap-3 rounded-xl border p-6">
      <CommandPalette
        hotkey={false}
        items={[
          {
            items: [
              {
                description: "Resolves after one second, then closes.",
                label: "Sync workspace",
                onSelect: async () => {
                  await wait(1000);
                  setLastAction("Workspace synced");
                },
                shortcut: "⌘S",
                value: "sync-workspace",
              },
            ],
            label: "Workspace",
            type: "group",
            value: "workspace",
          },
          {
            items: [
              {
                description: "Fails after one second and stays open for retry.",
                label: "Run failing job",
                onSelect: async () => {
                  await wait(1000);
                  throw new Error("Demo failure");
                },
                value: "run-failing-job",
              },
            ],
            label: "Diagnostics",
            type: "group",
            value: "diagnostics",
          },
        ]}
        trigger={<Button variant="outline">Open command palette</Button>}
      />
      <p aria-live="polite" className="text-muted-foreground text-sm">
        Last action: {lastAction}
      </p>
    </div>
  );
};

export default Demo;
