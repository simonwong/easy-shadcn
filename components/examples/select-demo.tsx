import { Select } from "@/registry/ui/select";

const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Durian", value: "durian" },
  { label: "Elderberry", value: "elderberry" },
];

const Demo = () => (
  <div className="w-64">
    <Select items={items} placeholder="Pick a fruit" />
  </div>
);

export default Demo;
