import { RadioGroup } from "@/registry/ui/radio-group";

const Demo = () => (
  <div className="space-y-8">
    <RadioGroup
      defaultValue="comfortable"
      items={[
        { label: "Default", value: "default" },
        { label: "Comfortable", value: "comfortable" },
        { disabled: true, label: "Compact (disabled)", value: "compact" },
      ]}
    />

    <RadioGroup
      defaultValue="free"
      items={[
        {
          description: "Up to 3 projects, community support.",
          label: "Free",
          value: "free",
        },
        {
          description: "Unlimited projects, priority support.",
          label: "Pro",
          value: "pro",
        },
      ]}
    />
  </div>
);

export default Demo;
