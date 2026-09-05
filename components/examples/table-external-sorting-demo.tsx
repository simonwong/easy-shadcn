import { useState } from "react";
import { defineColumns, Table, type TableSort } from "@/registry/ui/table";

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
  { dataIndex: "name", key: "name", title: "Project" },
  {
    align: "right",
    dataIndex: "tasks",
    key: "tasks",
    sorter: true,
    title: "Server tasks",
  },
]);

const Demo = () => {
  const [sort, setSort] = useState<TableSort | null>(null);
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Intent-only example: the header changes, but supplied rows keep their
        order. In an app, use the request to fetch an ordered page.
      </p>
      <div className="rounded-md border">
        <Table
          aria-label="Externally ordered projects"
          columns={columns}
          dataSource={projects}
          onSortChange={setSort}
          rowKey="id"
          sort={sort}
        />
      </div>
      <p className="text-muted-foreground text-sm">
        Requested order: {sort?.order ?? "none"}
      </p>
    </div>
  );
};

export default Demo;
