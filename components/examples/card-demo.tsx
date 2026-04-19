import { AsyncButton } from "@/registry/ui/async-button";
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
