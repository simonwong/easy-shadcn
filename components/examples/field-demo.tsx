import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/registry/ui/field";
import { Select } from "@/registry/ui/select";

const roleItems = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Member", value: "member" },
];

const Demo = () => (
  <div className="w-full max-w-md space-y-5">
    <Field
      description="Used for workspace notifications."
      label="Email"
      required
    >
      <Input placeholder="ada@example.com" type="email" />
    </Field>

    <Field
      description="Controls billing and member management access."
      label="Role"
    >
      <Select items={roleItems} placeholder="Pick a role" />
    </Field>

    <Field error="Bio must be at least 20 characters." label="Bio">
      <Textarea placeholder="Tell the team what this person owns." />
    </Field>

    <Field orientation="horizontal">
      <Checkbox id="weekly-summary" />
      <FieldContent>
        <FieldLabel htmlFor="weekly-summary">Weekly summary</FieldLabel>
        <FieldDescription>Send a short digest every Monday.</FieldDescription>
      </FieldContent>
    </Field>

    <Field orientation="horizontal">
      <Checkbox id="touch-id" />
      <FieldContent>
        <FieldTitle>Touch ID</FieldTitle>
        <FieldDescription>Unlock your workspace faster.</FieldDescription>
      </FieldContent>
    </Field>
  </div>
);

export default Demo;
