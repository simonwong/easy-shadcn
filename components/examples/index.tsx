
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
