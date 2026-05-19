import { useState } from "react";
import { defineColumns, Table } from "@/registry/ui/table";

interface Member {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
}

const data: Member[] = [
  { id: "u1", name: "Ada Lovelace", role: "owner" },
  { id: "u2", name: "Linus Torvalds", role: "admin" },
  { id: "u3", name: "Grace Hopper", role: "member" },
  { id: "u4", name: "Alan Turing", role: "member" },
];

const columns = defineColumns<Member>()([
  { dataIndex: "name", key: "name", title: "Name" },
  { dataIndex: "role", key: "role", title: "Role" },
]);

const Demo = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Selected: {selected.length === 0 ? "none" : selected.join(", ")} (the
        owner row is non-selectable)
      </p>
      <div className="rounded-md border">
        <Table
          aria-label="Team members"
          columns={columns}
          dataSource={data}
          getCheckboxProps={(record) => ({
            // Human-readable label so screen readers announce the row
            // identity, not the opaque rowKey.
            "aria-label": `Select ${record.name}`,
            disabled: record.role === "owner",
          })}
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
