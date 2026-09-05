import { useState } from "react";
import { defineColumns, Table } from "@/registry/ui/table";

interface Project {
  id: string;
  name: string;
  tasks: number;
}

const projects: Project[] = Array.from({ length: 23 }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `Project ${String(index + 1).padStart(2, "0")}`,
  tasks: 23 - index,
}));

const columns = defineColumns<Project>()([
  { dataIndex: "name", key: "name", title: "Project" },
  {
    dataIndex: "tasks",
    key: "tasks",
    title: "Tasks",
    sorter: (a, b) => a.tasks - b.tasks,
  },
]);

export default function Demo() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Select this page, then move to another. Sorting keeps the current page.
      </p>
      <Table
        aria-label="Paginated projects"
        columns={columns}
        dataSource={projects}
        onSelectedRowKeysChange={setSelected}
        pagination={{ className: "pt-3" }}
        rowKey="id"
        selectable
        selectedRowKeys={selected}
      />
      <p className="text-muted-foreground text-sm">
        Selected: {selected.length} projects
      </p>
    </div>
  );
}
