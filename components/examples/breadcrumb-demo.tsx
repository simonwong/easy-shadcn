import { Breadcrumb } from "@/registry/ui/breadcrumb";

const trail = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/components", label: "Components" },
  { label: "Breadcrumb" },
];

const Demo = () => (
  <div className="space-y-8">
    <Breadcrumb items={trail} />

    <Breadcrumb items={trail} separator="/" />

    <Breadcrumb items={trail} maxItems={3} />
  </div>
);

export default Demo;
