"use client";

import { useState } from "react";
import { Select, type SelectItem } from "@/registry/ui/select";

const USERS: SelectItem[] = [
  { label: "Ada Lovelace", value: "ada" },
  { label: "Alan Turing", value: "alan" },
  { label: "Barbara Liskov", value: "barbara" },
  { label: "Donald Knuth", value: "donald" },
  { label: "Edsger Dijkstra", value: "edsger" },
  { label: "Grace Hopper", value: "grace" },
  { label: "John von Neumann", value: "john" },
  { label: "Linus Torvalds", value: "linus" },
  { label: "Margaret Hamilton", value: "margaret" },
  { label: "Richard Stallman", value: "richard" },
  { label: "Tim Berners-Lee", value: "tim" },
  { label: "Yukihiro Matsumoto", value: "yukihiro" },
];

const searchUsers = async (
  query: string,
  signal: AbortSignal
): Promise<SelectItem[]> => {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 450);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
  const q = query.trim().toLowerCase();
  if (!q) {
    return USERS.slice(0, 6);
  }
  return USERS.filter((u) => String(u.label).toLowerCase().includes(q)).slice(
    0,
    8
  );
};

const Demo = () => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="flex w-72 flex-col gap-2">
      <Select
        debounceMs={250}
        loadItems={searchUsers}
        multiple
        onValueChange={(next) => setValue((next as string[]) ?? [])}
        placeholder="Search reviewers"
        serverSideFilter
        value={value}
      />
      <p className="text-muted-foreground text-xs">
        Selected:{" "}
        <code className="text-foreground">
          {value.length === 0 ? "—" : value.join(", ")}
        </code>
      </p>
    </div>
  );
};

export default Demo;
