import { Tabs } from "@/registry/ui/tabs";

const Demo = () => (
  <div className="space-y-8">
    <Tabs
      defaultValue="first"
      items={[
        {
          trigger: "First",
          value: "first",
          content: (
            <div className="rounded-2xl border bg-accent p-6">
              First Content
            </div>
          ),
        },
        {
          trigger: "Second",
          value: "second",
          content: (
            <div className="rounded-2xl border bg-accent-foreground p-6 text-accent">
              Second Content
            </div>
          ),
        },
      ]}
    />

    <Tabs
      defaultValue="overview"
      items={[
        {
          trigger: "Overview",
          value: "overview",
          content: <div className="p-2">Line variant</div>,
        },
        {
          trigger: "Settings",
          value: "settings",
          content: <div className="p-2">Settings panel</div>,
        },
        {
          disabled: true,
          trigger: "Billing",
          value: "billing",
          content: null,
        },
      ]}
      variant="line"
    />
  </div>
);

export default Demo;
