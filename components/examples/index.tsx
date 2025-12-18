
// generate this file by scripts/genarate-example-entry.mjs
import React from "react";

export default {
  "button-demo": {
    component: React.lazy(() => import("./button-demo")),
    codeString: `import { XCircleIcon } from 'lucide-react';
import { Button } from '@/registry/ui/button';

const Demo = () => {
  const handleAsyncAction = async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000);
    });
  };
  return (
    <div className="flex gap-2">
      <Button onClick={handleAsyncAction}>Async Event Auto Show Loading</Button>
      <Button onClick={handleAsyncAction} size="icon" variant="destructive">
        <XCircleIcon />
      </Button>
    </div>
  );
};

export default Demo;
`
  },

  "card-demo": {
    component: React.lazy(() => import("./card-demo")),
    codeString: `import { Button } from '@/registry/ui/button';
import { Card } from '@/registry/ui/card';

const Demo = () => {
  return (
    <div className="space-y-4">
      <Card
        action={<Button variant="outline">More</Button>}
        className="w-128"
        description="some descriptions"
        footer={<Button>Button</Button>}
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
};

export default Demo;
`
  },

  "modal-alert-demo": {
    component: React.lazy(() => import("./modal-alert-demo")),
    codeString: `import { Button } from '@/registry/ui/button';
import { AlertModal } from '@/registry/ui/modal';

const Demo = () => {
  return (
    <div>
      <AlertModal
        content={
          <div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
          </div>
        }
        title="Alert Title"
        trigger={<Button>Alert Modal</Button>}
      />
    </div>
  );
};

export default Demo;
`
  },

  "modal-alert-helper-demo": {
    component: React.lazy(() => import("./modal-alert-helper-demo")),
    codeString: `import { Button } from '@/registry/ui/button';
import { AlertModal } from '@/registry/ui/modal';

const Demo = () => {
  return (
    <div className="space-x-2">
      <Button
        onClick={() => {
          AlertModal.alert({
            title: 'Tips',
            content: 'Alert Content',
          });
        }}
      >
        Click Alert
      </Button>
      <Button
        onClick={() => {
          AlertModal.confirm({
            title: 'Tips',
            content:
              'If onConfirm or onCancel is asynchronous events, the button will automatically display loading',
            onCancel: () => {
              console.log('cancel');
            },
            onConfirm: () =>
              new Promise((resolve) => {
                setTimeout(() => {
                  console.log('confirm');
                  resolve();
                }, 1000);
              }),
          });
        }}
      >
        Click Confirm
      </Button>
      <Button
        onClick={async () => {
          await AlertModal.alert({
            title: 'Tips1',
            content: 'Alert Content-1',
          });
          await AlertModal.alert({
            title: 'Tips2',
            content: 'Alert Content-2',
          });
        }}
      >
        Alert Step by Step
      </Button>
      <Button
        onClick={async () => {
          await AlertModal.alert({
            title: 'Tips1',
            content: (
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
                title: 'Tips1-1',
                content: 'Alert Content-1-1',
              });
            },
          });
        }}
      >
        Alert Step In Step
      </Button>
    </div>
  );
};

export default Demo;
`
  },

  "modal-demo": {
    component: React.lazy(() => import("./modal-demo")),
    codeString: `import { useState } from 'react';
import { Button } from '@/registry/ui/button';
import { Modal } from '@/registry/ui/modal';

const Demo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Modal
        footer={
          <div className="space-x-2">
            <Button
              onClick={() => {
                setShowModal(false);
              }}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button>Save</Button>
          </div>
        }
        onOpenChange={setShowModal}
        open={showModal}
        title="Modal Title"
        trigger={<Button>Click Show Modal</Button>}
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
    codeString: `import { useState } from 'react';
import { Button } from '@/registry/ui/button';
import { Modal } from '@/registry/ui/modal';

const ModalHelperModal = Modal.create(({ count }: { count: number }) => {
  const modal = Modal.useModal();

  return (
    <Modal
      {...modal.modalProps}
      footer={
        <div className="space-x-2">
          <Button
            onClick={() => {
              modal.hide();
            }}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button>Save</Button>
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
  const [action, ModalHolder] = Modal.useModalHolder(ModalHelperModal);

  const [count, setCount] = useState(0);

  const handleClick = () => {
    action.show();

    setTimeout(() => {
      setCount(count + 1);
    }, 1000);
  };

  return (
    <Modal.Provider>
      <Button onClick={handleClick}>Click Show Modal</Button>
      <p>Current Count: {count}</p>
      <ModalHolder count={count} />
    </Modal.Provider>
  );
};

export default Demo;
`
  },

  "modal-provider-demo": {
    component: React.lazy(() => import("./modal-provider-demo")),
    codeString: `import { Modal } from '@/registry/ui/modal';

const App = () => {
  return (
    <div>
      <Modal.Provider />
    </div>
  );
};

export default App;
`
  },

  "tabs-demo": {
    component: React.lazy(() => import("./tabs-demo")),
    codeString: `import { Tabs } from '@/registry/ui/tabs';

const Demo = () => {
  return (
    <Tabs
      defaultValue="first"
      option={[
        {
          title: 'First',
          value: 'first',
          content: (
            <div className="rounded-2xl border bg-accent p-6">
              First Content
            </div>
          ),
        },
        {
          title: 'Second',
          value: 'second',
          content: (
            <div className="rounded-2xl border bg-accent-foreground p-6 text-accent">
              Second Content
            </div>
          ),
        },
      ]}
    />
  );
};

export default Demo;
`
  },
} as const
