"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/registry/ui/alert";

const Demo = () => {
  const [restored, setRestored] = useState(false);

  return (
    <div className="w-full max-w-xl space-y-4">
      <Alert
        description="Your profile is ready for the next deployment."
        title="Changes saved"
      />

      <Alert
        description="All checks passed and the release can continue."
        icon={<CircleCheckIcon aria-hidden="true" />}
        title="Ready to deploy"
      />

      <Alert
        description="Reconnect your account before retrying this request."
        icon={<CircleAlertIcon aria-hidden="true" />}
        title="Session expired"
        variant="destructive"
      />

      <Alert
        action={
          <Button onClick={() => setRestored(true)} size="xs" variant="outline">
            Undo
          </Button>
        }
        description={
          restored
            ? "The archived messages have been restored."
            : "Five messages were moved to the archive."
        }
        icon={<CircleAlertIcon aria-hidden="true" />}
        title={restored ? "Messages restored" : "Messages archived"}
      />
    </div>
  );
};

export default Demo;
