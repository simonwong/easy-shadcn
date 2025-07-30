import { Tabs } from '@/registry/ui/tabs';

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
