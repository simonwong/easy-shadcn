"use client";

import {
  ChartNoAxesCombinedIcon,
  FolderKanbanIcon,
  HouseIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import {
  Sidebar,
  type SidebarItem,
  SidebarTrigger,
} from "@/registry/ui/sidebar";

const items: SidebarItem[] = [
  {
    items: [
      {
        icon: <HouseIcon aria-hidden="true" />,
        key: "overview",
        label: "Overview",
      },
      {
        extra: "12",
        icon: <FolderKanbanIcon aria-hidden="true" />,
        key: "projects",
        label: "Projects",
      },
      {
        icon: <ChartNoAxesCombinedIcon aria-hidden="true" />,
        key: "reports",
        label: "Reports",
      },
      {
        icon: <UsersIcon aria-hidden="true" />,
        items: [
          { key: "members", label: "Members" },
          { key: "invitations", label: "Invitations" },
        ],
        key: "team",
        label: "Team",
        type: "submenu",
      },
    ],
    key: "workspace",
    label: "Workspace",
    type: "group",
  },
  { key: "account-divider", type: "separator" },
  {
    icon: <SettingsIcon aria-hidden="true" />,
    key: "settings",
    label: "Settings",
  },
];

const Demo = () => (
  <div className="relative h-[32rem] w-full overflow-hidden rounded-xl border [&_[data-slot=sidebar-container]]:absolute [&_[data-slot=sidebar-container]]:h-full [&_[data-slot=sidebar-wrapper]]:min-h-full">
    <Sidebar
      content={
        <>
          <header className="flex h-14 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <div>
              <p className="font-medium text-sm">Acme workspace</p>
              <p className="text-muted-foreground text-xs">Overview</p>
            </div>
          </header>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            {[
              ["Active projects", "12"],
              ["Open tasks", "48"],
              ["Team members", "9"],
            ].map(([label, value]) => (
              <section className="rounded-lg border p-4" key={label}>
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="mt-2 font-semibold text-2xl">{value}</p>
              </section>
            ))}
          </div>
        </>
      }
      items={items}
    />
  </div>
);

export default Demo;
