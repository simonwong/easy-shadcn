"use client";

import { useState } from "react";
import { Menu, type MenuItem } from "@/registry/ui/menu";

const items: MenuItem[] = [
  { key: "overview", label: "Overview" },
  {
    children: [
      { key: "members", label: "Members" },
      { extra: "12", key: "invitations", label: "Invitations" },
    ],
    key: "team",
    label: "Team",
  },
  { key: "workspace-divider", type: "separator" },
  {
    children: [
      { key: "billing", label: "Billing" },
      { disabled: true, key: "audit-log", label: "Audit log" },
    ],
    key: "settings",
    label: "Settings",
    type: "group",
  },
];

const Demo = () => {
  const [selected, setSelected] = useState<string | undefined>("overview");

  return (
    <div className="grid w-full max-w-sm gap-4">
      <Menu
        aria-label="Workspace navigation"
        defaultOpenKeys={["team"]}
        items={items}
        mode="inline"
        onValueChange={setSelected}
        value={selected}
      />
      <p aria-live="polite" className="text-muted-foreground text-sm">
        Selected: {selected ?? "None"}
      </p>
    </div>
  );
};

export default Demo;
