
// generate this file by scripts/genarate-example-entry.mjs
import React from "react";

export default {
  "card-demo": {
    component: React.lazy(() => import("./card-demo")),
    codeString: `import { Button } from '@/components/ui/button';
import { Card } from '@/registry/ui/card';

const Demo = () => {
  return (
    <div className="space-y-4">
      {/* 基础使用 - 使用简化的 className API */}
      <Card
        action={<Button variant="outline">More</Button>}
        contentClassName="bg-white"
        description="some descriptions"
        descriptionClassName="text-gray-500"
        footer={<Button>Button</Button>}
        footerClassName="flex justify-end"
        title="Default Card"
      >
        <div>
          <div>content1-content1-content1</div>
          <div>content2</div>
          <div>content3</div>
        </div>
      </Card>

      {/* 高级使用 - 混合使用 className 和 xxxProps */}
      <Card
        description="using both className and props"
        footer="Custom Card Footer"
        footerClassName="border-t"
        headerClassName="border-b"
        title="Custom Card Header"
      >
        <div>
          <p>This demonstrates the dual API design:</p>
          <ul className="list-disc pl-5 text-sm">
            <li>Simple className for common cases</li>
            <li>xxxProps for complex scenarios</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Demo;
`
  },
} as const
