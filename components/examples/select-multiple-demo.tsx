import { Select } from "@/registry/ui/select";

const items = [
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "Ruby", value: "ruby" },
];

const Demo = () => (
  <div className="w-80">
    <Select items={items} multiple placeholder="Pick languages" />
  </div>
);

export default Demo;
