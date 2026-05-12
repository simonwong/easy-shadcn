"use client";

import { RefreshCwIcon, SendIcon, Trash2Icon } from "lucide-react";
import { AsyncButton } from "@/registry/ui/async-button";

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const Demo = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Click the button — loading state activates automatically while the
        promise is pending.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(2000)}>Submit Order</AsyncButton>
        <AsyncButton onClick={() => wait(2000)} variant="outline">
          Sync Data
        </AsyncButton>
        <AsyncButton onClick={() => wait(2000)} variant="secondary">
          Export Report
        </AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Drive loading externally via the <code>loading</code> prop.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton loading>Controlled Loading</AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Icon buttons with <code>size="icon"</code>.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(2000)} size="icon">
          <SendIcon />
        </AsyncButton>
        <AsyncButton onClick={() => wait(2000)} size="icon" variant="outline">
          <RefreshCwIcon />
        </AsyncButton>
        <AsyncButton
          onClick={() => wait(2000)}
          size="icon"
          variant="destructive"
        >
          <Trash2Icon />
        </AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Errors are caught and logged — the button recovers gracefully.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton
          onClick={() =>
            wait(1500).then(() => {
              throw new Error("Request failed");
            })
          }
          variant="destructive"
        >
          Simulate Failure
        </AsyncButton>
      </div>
    </div>
  </div>
);

export default Demo;
