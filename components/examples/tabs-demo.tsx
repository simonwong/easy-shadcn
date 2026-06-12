import { Tabs } from "@/registry/ui/tabs";

const Demo = () => (
  <div className="space-y-8">
    <Tabs
      defaultValue="first"
      items={[
        {
          label: "First",
          value: "first",
          content: (
            <div className="rounded-2xl border bg-accent p-6">
              First Content
            </div>
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

    <Tabs
      defaultValue="overview"
      items={[
        {
          label: "Overview",
          value: "overview",
          content: <div className="p-2">Line variant</div>,
        },
        {
          label: "Settings",
          value: "settings",
          content: <div className="p-2">Settings panel</div>,
        },
        {
          disabled: true,
          label: "Billing",
          value: "billing",
          content: null,
        },
      ]}
      variant="line"
    />
  </div>
);

export default Demo;
