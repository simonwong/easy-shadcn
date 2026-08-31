"use client";

import { Button } from "@/components/ui/button";
import { Toast, toast } from "@/registry/ui/toast";

const wait = (duration: number) =>
  new Promise<{ name: string }>((resolve) => {
    window.setTimeout(() => resolve({ name: "Design review" }), duration);
  });

const Demo = () => (
  <div className="flex flex-wrap gap-2">
    <Button
      onClick={() =>
        toast("Event created", { description: "Sunday at 9:00 AM" })
      }
      variant="outline"
    >
      Basic
    </Button>
    <Button onClick={() => toast.success("Changes saved")}>Success</Button>
    <Button
      onClick={() =>
        toast("Draft saved", {
          action: {
            label: "Undo",
            onClick: () => toast.info("Draft restored"),
          },
        })
      }
      variant="outline"
    >
      With action
    </Button>
    <Button
      onClick={() =>
        toast.promise(wait(1200), {
          error: "Could not create event",
          loading: "Creating event",
          success: ({ name }) => ({
            description: name,
            title: "Event created",
          }),
        })
      }
      variant="outline"
    >
      Promise
    </Button>
    <Toast />
  </div>
);

export default Demo;
