import { defineColumns, Table } from "@/registry/ui/table";

interface User {
  email: string;
  id: string;
  name: string;
  role: string;
}

const data: User[] = [
  { email: "ada@example.com", id: "1", name: "Ada Lovelace", role: "Owner" },
  {
    email: "linus@example.com",
    id: "2",
    name: "Linus Torvalds",
    role: "Admin",
  },
  { email: "grace@example.com", id: "3", name: "Grace Hopper", role: "Member" },
];

const columns = defineColumns<User>()([
  { dataIndex: "name", key: "name", title: "Name" },
  { dataIndex: "email", key: "email", title: "Email" },
  { align: "right", dataIndex: "role", key: "role", title: "Role" },
]);

const Demo = () => (
  <div className="rounded-md border">
    <Table
      aria-label="Team members"
      columns={columns}
      dataSource={data}
      rowKey="id"
    />
  </div>
);

export default Demo;
