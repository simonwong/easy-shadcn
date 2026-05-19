import { defineColumns, Table } from "@/registry/ui/table";

interface Server {
  cpu: number;
  id: string;
  name: string;
  region: string;
}

const data: Server[] = [
  { cpu: 32, id: "s1", name: "api-1", region: "us-east-1" },
  { cpu: 91, id: "s2", name: "api-2", region: "us-east-1" },
  { cpu: 12, id: "s3", name: "worker-1", region: "eu-west-1" },
  { cpu: 88, id: "s4", name: "worker-2", region: "ap-south-1" },
];

// Three-state status so the high-CPU signal travels through icon + text +
// colour — color alone fails colour-blind users (WCAG 1.4.1).
const statusFor = (cpu: number) => {
  if (cpu >= 80) {
    return "hot" as const;
  }
  if (cpu >= 60) {
    return "warm" as const;
  }
  return "ok" as const;
};

const statusIcon: Record<ReturnType<typeof statusFor>, string> = {
  hot: "▲",
  ok: "·",
  warm: "•",
};

const columns = defineColumns<Server>()([
  { dataIndex: "name", key: "name", title: "Server" },
  { dataIndex: "region", key: "region", title: "Region" },
  {
    align: "right",
    dataIndex: "cpu",
    key: "cpu",
    // `value` narrows to `number`.
    render: (value) => {
      const status = statusFor(value);
      return (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="font-mono">
            {statusIcon[status]}
          </span>
          <span>{value}%</span>
          <span className="sr-only">({status})</span>
        </span>
      );
    },
    title: "CPU",
  },
]);

const Demo = () => (
  <div className="rounded-md border">
    <Table
      aria-label="Server CPU usage"
      columns={columns}
      dataSource={data}
      rowClassName={(record) =>
        record.cpu >= 80 ? "bg-destructive/10" : undefined
      }
      rowKey="id"
    />
  </div>
);

export default Demo;
