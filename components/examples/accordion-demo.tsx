import { Accordion } from "@/registry/ui/accordion";

const Demo = () => (
  <div className="space-y-8">
    <Accordion
      defaultValue={["shipping"]}
      items={[
        {
          value: "shipping",
          trigger: "How long does shipping take?",
          content:
            "Orders ship within 1–2 business days and arrive in 3–5 days.",
        },
        {
          value: "returns",
          trigger: "What is the return policy?",
          content: "Return any unused item within 30 days for a full refund.",
        },
        {
          value: "support",
          trigger: "How do I contact support?",
          content:
            "Email support@example.com — we reply within one business day.",
        },
      ]}
    />

    <Accordion
      defaultValue={["build", "deploy"]}
      items={[
        {
          value: "build",
          trigger: "Build",
          content: "Multiple panels stay open at once with the multiple prop.",
        },
        {
          value: "deploy",
          trigger: "Deploy",
          content: "Push to main and CI publishes the registry automatically.",
        },
        {
          disabled: true,
          value: "archive",
          trigger: "Archive (disabled)",
          content: null,
        },
      ]}
      multiple
    />
  </div>
);

export default Demo;
