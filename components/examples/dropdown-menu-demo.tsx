"use client";

import {
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/registry/ui/dropdown-menu";

const Demo = () => {
  const [controlledOpen, setControlledOpen] = useState(false);
  const [lastAction, setLastAction] = useState("None");

  return (
    <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
      <section className="space-y-3">
        <h3 className="font-medium text-sm">Basic</h3>
        <DropdownMenu
          items={[
            { content: "Edit", value: "edit" },
            { content: "Duplicate", value: "duplicate" },
            { content: "Archive", value: "archive" },
          ]}
          trigger={<Button variant="outline">Open actions</Button>}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Controlled and observable</h3>
        <DropdownMenu
          items={[
            {
              content: "Rename project",
              onClick: () => setLastAction("Rename project"),
              value: "rename",
            },
            {
              content: "Duplicate project",
              onClick: () => setLastAction("Duplicate project"),
              value: "duplicate",
            },
          ]}
          onOpenChange={setControlledOpen}
          open={controlledOpen}
          trigger={<Button variant="outline">Project actions</Button>}
        />
        <p
          aria-live="polite"
          className="text-muted-foreground text-xs"
          role="status"
        >
          Menu: {controlledOpen ? "open" : "closed"}; last action: {lastAction}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Presentation</h3>
        <DropdownMenu
          items={[
            {
              content: "Edit",
              icon: <PencilIcon />,
              shortcut: "⌘E",
              value: "edit",
            },
            {
              content: "Duplicate",
              icon: <CopyIcon />,
              shortcut: "⌘D",
              value: "duplicate",
            },
            {
              content: "Move without icon",
              inset: true,
              value: "move",
            },
            {
              content: "Delete",
              icon: <Trash2Icon />,
              shortcut: "⌫",
              value: "delete",
              variant: "destructive",
            },
          ]}
          trigger={
            <Button
              aria-label="Open presentation menu"
              size="icon"
              variant="outline"
            >
              <MoreHorizontalIcon />
            </Button>
          }
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Disabled states</h3>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu
            disabled
            items={[{ content: "Unavailable action", value: "unavailable" }]}
            trigger={<Button variant="outline">Disabled menu</Button>}
          />
          <DropdownMenu
            items={[
              { content: "Available action", value: "available" },
              {
                content: "Disabled action",
                disabled: true,
                value: "disabled",
              },
            ]}
            trigger={<Button variant="outline">Mixed actions</Button>}
          />
        </div>
      </section>

      <section className="space-y-3 sm:col-span-2">
        <h3 className="font-medium text-sm">Position and classes</h3>
        <DropdownMenu
          align="end"
          contentClassName="w-56"
          itemClassName="py-2"
          items={[
            {
              content: "Open above the trigger",
              itemClassName: "font-medium",
              shortcut: "⌘O",
              value: "open",
            },
          ]}
          shortcutClassName="text-primary"
          side="top"
          sideOffset={8}
          trigger={<Button variant="outline">Positioned menu</Button>}
        />
      </section>
    </div>
  );
};

export default Demo;
