"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { Button } from "@/registry/ui/button";
import { FormModal } from "./features/FormModal";
import { InfoModal } from "./features/InfoModal";
import { PreviewGroup } from "./features/PreviewGroup";

const CompositePreview = () => {
  return (
    <div className="flex flex-wrap">
      <PreviewGroup>
        <Button
          onClick={() => {
            CommandModal.show(InfoModal, {
              username: "Easy Shadcn UI",
              remark: "This is a remark",
            });
          }}
        >
          Open Info Modal
        </Button>
        <Button
          onClick={() => {
            CommandModal.show(FormModal, {
              defaultValues: {
                username: "Easy Shadcn UI",
                remark: "This is a remark",
              },
            });
          }}
        >
          Open Form Modal
        </Button>
      </PreviewGroup>
    </div>
  );
};

export default CompositePreview;
