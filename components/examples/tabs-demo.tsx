import { Tabs } from "@/registry/ui/tabs";

const Demo = () => (
  <Tabs
    defaultValue="first"
    items={[
      {
        label: "First",
        value: "first",
        content: (
          <div className="rounded-2xl border bg-accent p-6">First Content</div>
        ),
      },
      {
        label: "Second",
        value: "second",
        content: (
          <div className="rounded-2xl border bg-accent-foreground p-6 text-accent">
            Second Content
          </div>
        ),
      },
    ]}
  />
);

export default Demo;
