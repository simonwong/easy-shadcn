import { useState } from "react";
import { defineColumns, Table } from "@/registry/ui/table";

interface Project {
  id: string;
  name: string;
  tasks: number;
}

const projects: Project[] = [
  { id: "atlas", name: "Atlas", tasks: 24 },
  { id: "beacon", name: "Beacon", tasks: 8 },
  { id: "canvas", name: "Canvas", tasks: 24 },
];

const columns = defineColumns<Project>()([
  {
    dataIndex: "name",
    key: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
    title: "Project",
  },
  {
    align: "right",
    dataIndex: "tasks",
    key: "tasks",
    sorter: (a, b) => a.tasks - b.tasks,
    title: "Tasks",
  },
]);

const Demo = () => {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Sort a column: ascending, descending, then original order. Selection
        follows each project.
      </p>
      <div className="rounded-md border">
        <Table
          aria-label="Sortable projects"
          columns={columns}
          dataSource={projects}
          getCheckboxProps={(project) => ({
            "aria-label": `Select ${project.name}`,
          })}
          onSelectedRowKeysChange={setSelected}
          rowKey="id"
          selectable
          selectedRowKeys={selected}
        />
      </div>
      <p className="text-muted-foreground text-sm">
        Selected: {selected.length ? selected.join(", ") : "none"}
      </p>
    </div>
  );
};

export default Demo;
