"use client";

import { useState } from "react";
import { defineColumns, Table, type TableFilters } from "@/registry/ui/table";

interface Member {
  id: string;
  name: string;
  role: string;
}
const suppliedPage: Member[] = [
  { id: "a", name: "Ada", role: "admin" },
  { id: "b", name: "Ben", role: "member" },
];
const columns = defineColumns<Member>()([
  { key: "name", dataIndex: "name", title: "Name" },
  {
    key: "role",
    dataIndex: "role",
    title: "Role",
    filter: {
      mode: "external",
      items: [
        { value: "admin", label: "Admin" },
        { value: "member", label: "Member" },
      ],
    },
  },
]);

export default function TableExternalFilteringDemo() {
  const [query, setQuery] = useState<{ filters: TableFilters; page: number }>({
    filters: {},
    page: 2,
  });
  return (
    <div className="w-full space-y-3">
      <p className="text-muted-foreground text-sm">
        Intent preview: the supplied rows stay unchanged. Your data layer
        fetches the requested result.
      </p>
      <Table
        caption="Server-filtered members"
        columns={columns}
        dataSource={suppliedPage}
        filters={query.filters}
        onFiltersChange={(filters, details) =>
          setQuery({ filters, page: details.pagination?.value ?? query.page })
        }
        pagination={{
          mode: "external",
          total: 24,
          pageSize: 2,
          value: query.page,
          onValueChange: (page) => setQuery({ ...query, page }),
        }}
        rowKey="id"
      />
      <pre
        aria-live="polite"
        className="overflow-x-auto rounded-md bg-muted p-3 text-xs"
      >
        {JSON.stringify(query, null, 2)}
      </pre>
    </div>
  );
}
