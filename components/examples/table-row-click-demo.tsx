import { useState } from "react";
import { defineColumns, Table } from "@/registry/ui/table";

interface Member {
  email: string;
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
}

const data: Member[] = [
  { email: "ada@example.com", id: "u1", name: "Ada Lovelace", role: "owner" },
  {
    email: "linus@example.com",
    id: "u2",
    name: "Linus Torvalds",
    role: "admin",
  },
  {
    email: "grace@example.com",
    id: "u3",
    name: "Grace Hopper",
    role: "member",
  },
  { email: "alan@example.com", id: "u4", name: "Alan Turing", role: "member" },
];

const columns = defineColumns<Member>()([
  { dataIndex: "name", key: "name", title: "Name" },
  { dataIndex: "email", key: "email", title: "Email" },
  { dataIndex: "role", key: "role", title: "Role" },
]);

const Demo = () => {
  const [viewing, setViewing] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        {viewing ? `Viewing ${viewing}` : "Click a row, or Tab + Enter / Space"}
        {selected.length > 0 ? ` · selected: ${selected.join(", ")}` : ""}
      </p>
      <div className="rounded-md border">
        <Table
          aria-label="Team members"
          columns={columns}
          dataSource={data}
          getCheckboxProps={(record) => ({
            "aria-label": `Select ${record.name}`,
          })}
          onRowClick={(record) => setViewing(record.id)}
          onSelectedRowKeysChange={setSelected}
          rowKey="id"
          selectable
          selectedRowKeys={selected}
        />
      </div>
    </div>
  );
};

export default Demo;
