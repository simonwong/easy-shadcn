import { ChoiceGroup } from "@/registry/ui/choice-group";

const channels = [
  {
    description: "Product news and account updates.",
    label: "Email",
    value: "email",
  },
  {
    description: "Short alerts for time-sensitive events.",
    label: "SMS",
    value: "sms",
  },
];

const Demo = () => (
  <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-2">
    <section className="grid content-start gap-3">
      <h3 className="font-medium text-sm">Single · radio</h3>
      <ChoiceGroup
        aria-label="Primary channel"
        defaultValue="email"
        items={channels}
      />
    </section>

    <section className="grid content-start gap-3">
      <h3 className="font-medium text-sm">Multiple · checkbox</h3>
      <ChoiceGroup
        aria-label="Notification channels"
        defaultValue={["email"]}
        items={channels}
        selectionMode="multiple"
      />
    </section>

    <section className="grid content-start gap-3 sm:col-span-2">
      <h3 className="font-medium text-sm">Single · toggle</h3>
      <ChoiceGroup
        aria-label="Density"
        defaultValue="comfortable"
        items={[
          { label: "Compact", value: "compact" },
          { label: "Comfortable", value: "comfortable" },
          { label: "Spacious", value: "spacious" },
        ]}
        orientation="horizontal"
        presentation="toggle"
        spacing={0}
        variant="outline"
      />
    </section>
  </div>
);

export default Demo;
