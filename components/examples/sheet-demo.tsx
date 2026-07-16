"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AsyncButton } from "@/registry/ui/async-button";
import { Sheet } from "@/registry/ui/sheet";

const ACTIVITY_ITEMS = Array.from(
  { length: 18 },
  (_, index) => `Activity item ${index + 1}`
);

const Demo = () => {
  const [controlledOpen, setControlledOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Sheet
        content={
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sheet-name">Name</Label>
              <Input defaultValue="Ada Lovelace" id="sheet-name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sheet-bio">Bio</Label>
              <Textarea
                defaultValue="Building thoughtful interfaces."
                id="sheet-bio"
              />
            </div>
          </div>
        }
        description="Update the profile shown to your team."
        footer={
          <div className="flex justify-end">
            <AsyncButton>Save changes</AsyncButton>
          </div>
        }
        title="Account settings"
        trigger={
          <AsyncButton variant="outline">Open account sheet</AsyncButton>
        }
      />

      <Sheet
        content={
          <div className="space-y-3 text-muted-foreground">
            <p>The application owns this sheet's open state.</p>
            <p>Its footer is caller-owned and closes explicitly.</p>
          </div>
        }
        footer={
          <AsyncButton
            onClick={() => setControlledOpen(false)}
            variant="outline"
          >
            Close controlled sheet
          </AsyncButton>
        }
        onOpenChange={setControlledOpen}
        open={controlledOpen}
        side="left"
        title="Controlled inspector"
        trigger={
          <AsyncButton variant="outline">Open controlled sheet</AsyncButton>
        }
      />

      <Sheet
        content={
          <ol className="grid gap-3">
            {ACTIVITY_ITEMS.map((item) => (
              <li className="rounded-lg border p-3" key={item}>
                {item}
              </li>
            ))}
          </ol>
        }
        description="The body scrolls independently while the action stays available."
        footer={
          <AsyncButton onClick={() => setWorkflowOpen(false)}>
            Finish workflow
          </AsyncButton>
        }
        onOpenChange={setWorkflowOpen}
        open={workflowOpen}
        showCloseButton={false}
        side="bottom"
        title="Recent activity"
        trigger={
          <AsyncButton variant="outline">Open activity sheet</AsyncButton>
        }
      />
    </div>
  );
};

export default Demo;
