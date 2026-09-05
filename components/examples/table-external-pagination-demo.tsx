import { useState } from "react";
import { defineColumns, Table } from "@/registry/ui/table";

interface Project {
  id: string;
  name: string;
}

const columns = defineColumns<Project>()([
  { dataIndex: "name", key: "name", title: "Project" },
]);

export default function Demo() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const total = 12;
  const start = (page - 1) * pageSize;
  const rows = Array.from(
    { length: Math.min(pageSize, total - start) },
    (_, index) => ({
      id: `project-${start + index + 1}`,
      name: `Project ${start + index + 1}`,
    })
  );
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Simulated server page: the caller supplies only this page's records.
      </p>
      <Table
        aria-label="External paginated projects"
        columns={columns}
        dataSource={rows}
        pagination={{
          mode: "external",
          total,
          pageSize,
          value: page,
          onValueChange: setPage,
          "aria-label": "External project pages",
          className: "pt-3",
        }}
        rowKey="id"
      />
      <p className="text-muted-foreground text-sm">
        Page {page}. Supplied records: {rows.length}.
      </p>
    </div>
  );
}
