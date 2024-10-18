import { Select } from '@easy-shadcn/react';

const Demo = () => {
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Select
          width={200}
          options={[
            {
              value: 1,
              label: 'Option 1',
            },
            {
              value: 2,
              label: 'Option 2',
            },
            {
              value: 3,
              label: 'Option 3',
            },
          ]}
          placeholder="please select"
        />
        <Select
          width={200}
          allowClear
          options={[
            {
              value: 1,
              label: 'Option 1',
            },
            {
              value: 2,
              label: 'Option 2',
            },
            {
              value: 3,
              label: 'Option 3',
            },
          ]}
          placeholder="allow clear"
        />
      </div>
    </div>
  );
};

export default Demo;
