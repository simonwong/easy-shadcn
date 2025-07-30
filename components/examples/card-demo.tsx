import { Button } from '@/registry/ui/button';
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
