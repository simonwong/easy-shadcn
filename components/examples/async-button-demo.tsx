import { XCircleIcon } from "lucide-react";
import { AsyncButton } from "@/registry/ui/async-button";

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const Demo = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center gap-2">
      <AsyncButton onClick={() => wait(1000)}>
        Async Event Auto Loading
      </AsyncButton>
      <AsyncButton loading>Controlled Loading</AsyncButton>
      <AsyncButton disabled>Disabled</AsyncButton>
      <AsyncButton onClick={() => wait(1000)} size="icon" variant="destructive">
        <XCircleIcon />
      </AsyncButton>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <AsyncButton variant="default">Default</AsyncButton>
      <AsyncButton variant="outline">Outline</AsyncButton>
      <AsyncButton variant="secondary">Secondary</AsyncButton>
      <AsyncButton variant="ghost">Ghost</AsyncButton>
      <AsyncButton variant="destructive">Destructive</AsyncButton>
      <AsyncButton variant="link">Link</AsyncButton>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <AsyncButton size="xs">xs</AsyncButton>
      <AsyncButton size="sm">sm</AsyncButton>
      <AsyncButton size="default">default</AsyncButton>
      <AsyncButton size="lg">lg</AsyncButton>
    </div>
  </div>
);

export default Demo;
