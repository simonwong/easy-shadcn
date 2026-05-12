
// generate this file by scripts/genarate-example-entry.mjs
import React from "react";

export default {
  "async-button-demo": {
    component: React.lazy(() => import("./async-button-demo")),
    codeString: `"use client";

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
`
  },

  "card-demo": {
    component: React.lazy(() => import("./card-demo")),
    codeString: `import { AsyncButton } from "@/registry/ui/async-button";
import { Card } from "@/registry/ui/card";

const Demo = () => (
  <div className="space-y-4">
    <Card
      action={<AsyncButton variant="outline">More</AsyncButton>}
      className="w-128"
      description="some descriptions"
      footer={<AsyncButton>Button</AsyncButton>}
      footerClassName="flex justify-end"
      title="Default Card"
    >
      <div>
        <div>No dividers</div>
        <div>No dividers</div>
        <div>No dividers</div>
      </div>
    </Card>

    <Card
      className="w-72"
      contentClassName="bg-white"
      description="using className"
      descriptionClassName="text-gray-500"
      dividers
      footer="Custom Card Footer"
      size="sm"
      title="Small Card"
    >
      <ul>
        <li>Size: sm</li>
        <li>dividers: true</li>
      </ul>
    </Card>
  </div>
);

export default Demo;
`
  },

  "modal-alert-demo": {
    component: React.lazy(() => import("./modal-alert-demo")),
    codeString: `import { AsyncButton } from "@/registry/ui/async-button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => (
  <div>
    <AlertModal
      description="Modal Content"
      title="Alert Title"
      trigger={<AsyncButton>Alert Modal</AsyncButton>}
    />
  </div>
);

export default Demo;
`
  },

  "modal-alert-helper-demo": {
    component: React.lazy(() => import("./modal-alert-helper-demo")),
    codeString: `import { AsyncButton } from "@/registry/ui/async-button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => (
  <div className="space-x-2">
    <AsyncButton
      onClick={() => {
        AlertModal.alert({
          title: "Tips",
          description: "Alert Content",
        });
      }}
    >
      Click Alert
    </AsyncButton>
    <AsyncButton
      onClick={() => {
        AlertModal.confirm({
          title: "Tips",
          description:
            "If onConfirm or onCancel is asynchronous events, the button will automatically display loading",
          onCancel: () => {
            console.log("cancel");
          },
          onConfirm: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                console.log("confirm");
                resolve();
              }, 1000);
            }),
        });
      }}
    >
      Click Confirm
    </AsyncButton>
    <AsyncButton
      onClick={async () => {
        await AlertModal.alert({
          title: "Tips1",
          description: "Alert Content-1",
        });
        await AlertModal.alert({
          title: "Tips2",
          description: "Alert Content-2",
        });
      }}
    >
      Alert Step by Step
    </AsyncButton>
    <AsyncButton
      onClick={async () => {
        await AlertModal.alert({
          title: "Tips1",
          description: (
            <div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
            </div>
          ),
          onConfirm: async () => {
            await AlertModal.alert({
              title: "Tips1-1",
              description: "Alert Content-1-1",
            });
          },
        });
      }}
    >
      Alert Step In Step
    </AsyncButton>
  </div>
);

export default Demo;
`
  },

  "modal-demo": {
    component: React.lazy(() => import("./modal-demo")),
    codeString: `import { useState } from "react";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

const Demo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Modal
        footer={
          <div className="space-x-2">
            <AsyncButton
              onClick={() => {
                setShowModal(false);
              }}
              variant="ghost"
            >
              Cancel
            </AsyncButton>
            <AsyncButton>Save</AsyncButton>
          </div>
        }
        onOpenChange={setShowModal}
        open={showModal}
        title="Modal Title"
        trigger={<AsyncButton>Click Show Modal</AsyncButton>}
      >
        <div>Modal Content</div>
        <div>Modal Content</div>
        <div>Modal Content</div>
        <div>Modal Content</div>
      </Modal>
    </div>
  );
};

export default Demo;
`
  },

  "modal-helper-holder-demo": {
    component: React.lazy(() => import("./modal-helper-holder-demo")),
    codeString: `import { useRef, useState } from "react";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

const CommandModalModal = Modal.create(({ count }: { count: number }) => {
  const modal = Modal.useModal();

  return (
    <Modal
      {...modal.modalProps}
      footer={
        <div className="space-x-2">
          <AsyncButton
            onClick={() => {
              modal.hide();
            }}
            variant="ghost"
          >
            Cancel
          </AsyncButton>
          <AsyncButton>Save</AsyncButton>
        </div>
      }
      title="Modal Will Update by props"
    >
      <p>AnyModalContent: {count}</p>
      <p>Count will be updated in 1 second</p>
    </Modal>
  );
});

const Demo = () => {
  const [action, ModalHolder] = Modal.useModalHolder(CommandModalModal);

  const [count, setCount] = useState(0);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    countRef.current && clearInterval(countRef.current);
    action.show();

    countRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  return (
    <Modal.Provider>
      <AsyncButton onClick={handleClick}>Click Show Modal</AsyncButton>
      <p>Current Count: {count}</p>
      <ModalHolder count={count} />
    </Modal.Provider>
  );
};

export default Demo;
`
  },

  "tabs-demo": {
    component: React.lazy(() => import("./tabs-demo")),
    codeString: `import { Tabs } from "@/registry/ui/tabs";

const Demo = () => (
  <Tabs
    defaultValue="first"
    items={[
      {
        label: "First",
        value: "first",
        content: (
          <div className="rounded-2xl border bg-accent p-6">First Content</div>
        ),
      },
      {
        label: "Second",
        value: "second",
        content: (
          <div className="rounded-2xl border bg-accent-foreground p-6 text-accent">
            Second Content
          </div>
        ),
      },
    ]}
  />
);

export default Demo;
`
  },
} as const
