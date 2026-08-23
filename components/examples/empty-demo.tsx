"use client";

import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Empty } from "@/registry/ui/empty";

const Demo = () => {
  const [result, setResult] = useState("No project created yet.");

  return (
    <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2">
      <Empty
        aria-labelledby="empty-projects-title"
        className="min-h-72 border bg-background"
        content={
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={() => {
                setResult("Project created.");
              }}
              type="button"
            >
              Create project
            </Button>
            <p
              className="text-muted-foreground text-xs"
              data-demo-result
              role="status"
            >
              {result}
            </p>
          </div>
        }
        description="Create a project to organize files, tasks, and teammates."
        media={<FolderPlusIcon aria-hidden="true" />}
        mediaVariant="icon"
        title={<h3 id="empty-projects-title">No projects</h3>}
      />

      <Empty
        aria-labelledby="empty-teammates-title"
        className="min-h-72 border border-dashed bg-muted/30"
        description="Invited teammates will appear here after they join."
        media={
          <Avatar aria-label="Avery Chen" role="img">
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        }
        title={<h3 id="empty-teammates-title">No teammates</h3>}
      />

      <Empty
        aria-label="Content-only empty state"
        className="border bg-background py-6 md:col-span-2"
        content={
          <p className="text-muted-foreground text-sm">
            Content can render without an empty header.
          </p>
        }
        data-demo="content-only"
      />
    </div>
  );
};

export default Demo;
