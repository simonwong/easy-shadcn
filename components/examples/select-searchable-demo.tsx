import { Select } from "@/registry/ui/select";

const items = [
  { label: "Afghanistan", value: "af" },
  { label: "Albania", value: "al" },
  { label: "Algeria", value: "dz" },
  { label: "Argentina", value: "ar" },
  { label: "Australia", value: "au" },
  { label: "Austria", value: "at" },
  { label: "Belgium", value: "be" },
  { label: "Brazil", value: "br" },
  { label: "Canada", value: "ca" },
  { label: "Chile", value: "cl" },
  { label: "China", value: "cn" },
  { label: "Colombia", value: "co" },
  { label: "Denmark", value: "dk" },
  { label: "Egypt", value: "eg" },
  { label: "Finland", value: "fi" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "Greece", value: "gr" },
  { label: "India", value: "in" },
  { label: "Indonesia", value: "id" },
  { label: "Italy", value: "it" },
  { label: "Japan", value: "jp" },
  { label: "Mexico", value: "mx" },
  { label: "Netherlands", value: "nl" },
  { label: "Norway", value: "no" },
  { label: "Poland", value: "pl" },
  { label: "Portugal", value: "pt" },
  { label: "Russia", value: "ru" },
  { label: "Spain", value: "es" },
  { label: "Sweden", value: "se" },
  { label: "Switzerland", value: "ch" },
  { label: "United Kingdom", value: "gb" },
  { label: "United States", value: "us" },
];

const Demo = () => (
  <div className="w-64">
    <Select clearable items={items} placeholder="Search a country" searchable />
  </div>
);

export default Demo;
