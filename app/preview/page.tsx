"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { Button } from "@/registry/ui/button";
import { Card } from "@/registry/ui/card";
import { Tabs } from "@/registry/ui/tabs";
import { FormModal } from "./features/FormModal";
import { InfoModal } from "./features/InfoModal";
import { PreviewGroup } from "./features/PreviewGroup";

const CompositePreview = () => {
  return (
    <div className="flex flex-wrap">
      <PreviewGroup>
        <Tabs
          className="max-w-sm"
          defaultValue="login"
          option={[
            {
              title: "Login",
              value: "login",
              content: (
                <Card
                  action={<div>Extra</div>}
                  className="w-80"
                  description="Card Description"
                  footer={<Button>Hi</Button>}
                  footerClassName="flex justify-end"
                  title="Login"
                >
                  Card Content, Card Content, Card Content, Card Content
                </Card>
              ),
            },
            {
              title: "Signup",
              value: "signup",
              content: (
                <Card title="Signup Card">
                  Card Content, Card Content, Card Content, Card Content
                </Card>
              ),
            },
          ]}
        />
      </PreviewGroup>
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
