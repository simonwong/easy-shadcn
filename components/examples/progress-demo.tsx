"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/registry/ui/progress";

const Demo = () => {
  const [releaseValue, setReleaseValue] = useState(75);

  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <section className="space-y-3">
        <h3 className="font-medium text-sm">Basic</h3>
        <Progress label="Upload progress" value={56} />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Complete</h3>
        <Progress label="Deployment progress" value={100} />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Indeterminate</h3>
        <Progress label="Background sync progress" value={null} />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Hidden value</h3>
        <Progress label="Indexing progress" showValue={false} value={64} />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Visually hidden label</h3>
        <Progress
          label="Profile import progress"
          labelClassName="sr-only"
          value={42}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Custom accessible value</h3>
        <Progress
          aria-valuetext="1 of 4 batches"
          label="Archive progress"
          value={25}
        />
      </section>

      <section className="space-y-3 sm:col-span-2">
        <h3 className="font-medium text-sm">Caller-controlled advancement</h3>
        <Progress label="Release rollout progress" value={releaseValue} />
        <Button
          disabled={releaseValue === 100}
          onClick={() => setReleaseValue(100)}
          size="sm"
          type="button"
          variant="outline"
        >
          Complete rollout
        </Button>
      </section>
    </div>
  );
};

export default Demo;
