"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { AsyncButton } from "@/registry/ui/async-button";
import { FormModal } from "./features/FormModal";
import { InfoModal } from "./features/InfoModal";
import { PreviewGroup } from "./features/PreviewGroup";

const CompositePreview = () => (
  <div className="flex flex-wrap">
    <PreviewGroup>
      <AsyncButton
        onClick={() => {
          CommandModal.show(InfoModal, {
            username: "Easy Shadcn UI",
            remark: "This is a remark",
          });
        }}
      >
        Open Info Modal
      </AsyncButton>
      <AsyncButton
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
      </AsyncButton>
    </PreviewGroup>
  </div>
);

export default CompositePreview;
