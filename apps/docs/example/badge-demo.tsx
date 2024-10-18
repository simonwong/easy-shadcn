import { Badge } from '@easy-shadcn/react';

const Demo = () => {
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Badge>default</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
      </div>
    </div>
  );
};

export default Demo;
