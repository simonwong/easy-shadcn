"use client";

import { Select, type SelectItem } from "@/registry/ui/select";

const COUNTRIES: SelectItem[] = [
  { label: "Argentina", value: "ar" },
  { label: "Australia", value: "au" },
  { label: "Brazil", value: "br" },
  { label: "Canada", value: "ca" },
  { label: "China", value: "cn" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "India", value: "in" },
  { label: "Italy", value: "it" },
  { label: "Japan", value: "jp" },
  { label: "Mexico", value: "mx" },
  { label: "Netherlands", value: "nl" },
  { label: "Spain", value: "es" },
  { label: "United Kingdom", value: "uk" },
  { label: "United States", value: "us" },
];

const loadCountries = async (
  _query: string,
  signal: AbortSignal
): Promise<SelectItem[]> => {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 600);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
  return COUNTRIES;
};

const Demo = () => (
  <div className="w-64">
    <Select
      clearable
      loadItems={loadCountries}
      loadOn="open"
      placeholder="Search a country"
      searchable
    />
  </div>
);

export default Demo;
