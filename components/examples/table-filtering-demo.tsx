"use client";

import { defineColumns, Table } from "@/registry/ui/table";

interface Member {
  id: string;
  name: string;
  role: string;
  tasks: number;
  team: string;
}
const members: Member[] = [
  { id: "ada", name: "Ada", role: "admin", team: "Product", tasks: 12 },
  { id: "ben", name: "Ben", role: "member", team: "Support", tasks: 8 },
  { id: "cat", name: "Cat", role: "admin", team: "Support", tasks: 5 },
  { id: "dan", name: "Dan", role: "guest", team: "Product", tasks: 2 },
  { id: "eve", name: "Eve", role: "member", team: "Product", tasks: 10 },
  { id: "fin", name: "Fin", role: "guest", team: "Support", tasks: 1 },
];
const columns = defineColumns<Member>()([
  { key: "name", dataIndex: "name", title: "Name" },
  {
    key: "role",
    dataIndex: "role",
    title: "Role",
    filter: {
      items: [
        { value: "admin", label: "Admin" },
        { value: "member", label: "Member" },
        { value: "guest", label: "Guest" },
      ],
      onFilter: (value, record) => record.role === value,
    },
  },
  {
    key: "team",
    dataIndex: "team",
    title: "Team",
    filter: {
      multiple: false,
      items: [
        { value: "Product", label: "Product" },
        { value: "Support", label: "Support" },
      ],
      onFilter: (value, record) => record.team === value,
    },
  },
  {
    key: "tasks",
    dataIndex: "tasks",
    title: "Tasks",
    sorter: (a, b) => a.tasks - b.tasks,
  },
]);

export default function TableFilteringDemo() {
  return (
    <div className="w-full space-y-3">
      <p className="text-muted-foreground text-sm">
        Filter by role or team, then sort by tasks. Selected rows stay selected
        when hidden.
      </p>
      <Table
        caption="Team members"
        columns={columns}
        dataSource={members}
        getCheckboxProps={(record) => ({
          "aria-label": `Select ${record.name}`,
        })}
        pagination={{ pageSize: 3 }}
        rowKey="id"
        selectable
      />
    </div>
  );
}
