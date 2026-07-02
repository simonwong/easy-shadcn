"use client";

import { useState } from "react";
import { CheckboxGroup } from "@/registry/ui/checkbox-group";

const Demo = () => {
  const [value, setValue] = useState<string[]>(["email"]);

  return (
    <div className="space-y-8">
      {/* Uncontrolled with defaultValue */}
      <CheckboxGroup
        defaultValue={["comfortable"]}
        items={[
          { label: "Default", value: "default" },
          { label: "Comfortable", value: "comfortable" },
          { disabled: true, label: "Compact (disabled)", value: "compact" },
        ]}
      />

      {/* Uncontrolled with descriptions */}
      <CheckboxGroup
        defaultValue={["analytics"]}
        items={[
          {
            description: "Track visits and conversions.",
            label: "Analytics",
            value: "analytics",
          },
          {
            description: "Personalize content and ads.",
            label: "Marketing",
            value: "marketing",
          },
        ]}
      />

      {/* Controlled */}
      <CheckboxGroup
        items={[
          { label: "Email", value: "email" },
          { label: "SMS", value: "sms" },
          { label: "Push", value: "push" },
        ]}
        onValueChange={setValue}
        value={value}
      />

      {/* Styled via class overrides */}
      <CheckboxGroup
        descriptionClassName="text-gray-500"
        items={[
          {
            description: "This whole group is disabled.",
            label: "Locked",
            value: "locked",
          },
        ]}
        labelClassName="font-semibold"
      />
    </div>
  );
};

export default Demo;
