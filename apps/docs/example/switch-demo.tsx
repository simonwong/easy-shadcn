import { Switch } from '@easy-shadcn/react';

const Demo = () => {
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Switch label="Normal" />
        <Switch label="Controlled" checked />
      </div>
    </div>
  );
};

export default Demo;
