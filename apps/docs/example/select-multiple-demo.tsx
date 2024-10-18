import { Select } from '@easy-shadcn/react';

const Demo = () => {
  const options = [
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
    {
      value: 4,
      label: 'Option 4',
    },
    {
      value: 5,
      label: 'Option 5',
    },
  ];
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Select width={200} multiple options={options} placeholder="please multiple" />
        <Select width={200} multiple allowClear options={options} placeholder="allow clear" />
      </div>
    </div>
  );
};

export default Demo;
