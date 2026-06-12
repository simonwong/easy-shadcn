"use client";

import {
  ArrowRightIcon,
  DownloadIcon,
  RefreshCwIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
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
        Use <code>startIcon</code> / <code>endIcon</code>. While loading, the
        icon slot is swapped for the spinner — no overlay needed. When both are
        present, <code>startIcon</code> takes the spinner.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(2000)} startIcon={<SendIcon />}>
          Send Message
        </AsyncButton>
        <AsyncButton
          endIcon={<ArrowRightIcon />}
          onClick={() => wait(2000)}
          variant="outline"
        >
          Continue
        </AsyncButton>
        <AsyncButton
          endIcon={<ArrowRightIcon />}
          onClick={() => wait(2000)}
          startIcon={<DownloadIcon />}
          variant="secondary"
        >
          Download &amp; Next
        </AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Icon buttons — every <code>icon*</code> size swaps the lone icon for the
        spinner.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(2000)} size="icon-xs" variant="ghost">
          <RefreshCwIcon />
        </AsyncButton>
        <AsyncButton
          onClick={() => wait(2000)}
          size="icon-sm"
          variant="outline"
        >
          <RefreshCwIcon />
        </AsyncButton>
        <AsyncButton onClick={() => wait(2000)} size="icon">
          <SendIcon />
        </AsyncButton>
        <AsyncButton
          onClick={() => wait(2000)}
          size="icon-lg"
          variant="destructive"
        >
          <Trash2Icon />
        </AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Anti-flash: a 50ms task still shows the spinner for at least 200ms (the
        default <code>minDuration</code>), so the indicator never just flickers
        past.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(50)}>Fast Save (50ms)</AsyncButton>
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
