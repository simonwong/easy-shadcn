"use client";

import { useState } from "react";
import { ContextMenu } from "@/registry/ui/context-menu";

const Demo = () => {
  const [acceptControlledRequests, setAcceptControlledRequests] =
    useState(true);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [controlledRequests, setControlledRequests] = useState(0);
  const [lastAction, setLastAction] = useState("None");
  const [longPressRequests, setLongPressRequests] = useState(0);

  return (
    <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
      <section className="grid gap-3">
        <h3 className="font-medium text-sm">Uncontrolled actions</h3>
        <ContextMenu
          items={[
            {
              content: "Edit",
              icon: <span>✎</span>,
              onClick: () => setLastAction("Edit"),
              shortcut: "⌘E",
              value: "edit",
            },
            { content: "Archive", disabled: true, value: "archive" },
            {
              content: "Delete",
              onClick: () => setLastAction("Delete"),
              value: "delete",
              variant: "destructive",
            },
          ]}
          trigger={
            <button
              aria-label="Uncontrolled context target"
              className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-sm"
              type="button"
            >
              Right-click for actions
            </button>
          }
        />
        <p aria-live="polite" className="text-muted-foreground text-sm">
          Last action: {lastAction}
        </p>
      </section>

      <section className="grid gap-3">
        <h3 className="font-medium text-sm">Controlled requests</h3>
        <ContextMenu
          items={[
            {
              content: "Run controlled action",
              onClick: () => setLastAction("Controlled action"),
              value: "controlled-action",
            },
          ]}
          onOpenChange={(nextOpen) => {
            setControlledRequests((count) => count + 1);
            if (acceptControlledRequests) {
              setControlledOpen(nextOpen);
            }
          }}
          open={controlledOpen}
          trigger={
            <button
              aria-label="Controlled context target"
              className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-sm"
              type="button"
            >
              Right-click for controlled menu
            </button>
          }
        />
        <button
          aria-pressed={!acceptControlledRequests}
          className="w-fit rounded-md border px-3 py-1.5 text-sm"
          onClick={() => {
            setControlledOpen(false);
            setAcceptControlledRequests((accepted) => !accepted);
          }}
          type="button"
        >
          {acceptControlledRequests ? "Refuse requests" : "Accept requests"}
        </button>
        <p aria-live="polite" className="text-muted-foreground text-sm">
          Controlled requests:{" "}
          {acceptControlledRequests ? "accepted" : "refused"}; menu:{" "}
          {controlledOpen ? "open" : "closed"}; requests: {controlledRequests}
        </p>
      </section>

      <section className="grid gap-3">
        <h3 className="font-medium text-sm">Disabled root</h3>
        <ContextMenu
          disabled
          items={[{ content: "Unavailable action", value: "unavailable" }]}
          trigger={
            <button
              aria-label="Disabled context target"
              className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-sm"
              type="button"
            >
              Native context menu stays available
            </button>
          }
        />
        <p className="text-muted-foreground text-sm">
          Disabled root: Compose menu will not open.
        </p>
      </section>

      <section className="grid gap-3">
        <h3 className="font-medium text-sm">Touch long press</h3>
        <ContextMenu
          items={[
            {
              content: "Inspect touch target",
              onClick: () => setLastAction("Touch target"),
              value: "inspect-touch",
            },
          ]}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              setLongPressRequests((count) => count + 1);
            }
          }}
          trigger={
            <button
              aria-label="Long-press context target"
              className="flex h-32 w-full touch-none items-center justify-center rounded-lg border border-dashed text-sm"
              type="button"
            >
              Long-press for actions
            </button>
          }
        />
        <p aria-live="polite" className="text-muted-foreground text-sm">
          Long-press opens: {longPressRequests}
        </p>
      </section>
    </div>
  );
};

export default Demo;
