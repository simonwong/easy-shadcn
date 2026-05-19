import { useState } from "react";
import { Button } from "@/components/ui/button";
import { defineColumns, Table } from "@/registry/ui/table";

interface Order {
  amount: number;
  createdAt: string;
  customer: string;
  id: string;
  status: "paid" | "pending" | "refunded";
}

const data: Order[] = [
  {
    amount: 1299,
    createdAt: "2026-05-12",
    customer: "Acme Inc.",
    id: "ord_001",
    status: "paid",
  },
  {
    amount: 480,
    createdAt: "2026-05-14",
    customer: "Globex",
    id: "ord_002",
    status: "pending",
  },
  {
    amount: 75,
    createdAt: "2026-05-15",
    customer: "Initech",
    id: "ord_003",
    status: "refunded",
  },
];

const formatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const statusClass: Record<Order["status"], string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  refunded: "bg-zinc-100 text-zinc-800",
};

const Demo = () => {
  const [viewing, setViewing] = useState<string | null>(null);

  const columns = defineColumns<Order>()([
    { dataIndex: "id", key: "id", title: "Order" },
    { dataIndex: "customer", key: "customer", title: "Customer" },
    {
      align: "right",
      dataIndex: "amount",
      key: "amount",
      // `value` narrows to `number`.
      render: (value) => formatter.format(value),
      title: "Amount",
    },
    {
      dataIndex: "status",
      key: "status",
      // `value` narrows to Order["status"].
      render: (value) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 font-medium text-xs ${statusClass[value]}`}
        >
          {value}
        </span>
      ),
      title: "Status",
    },
    { dataIndex: "createdAt", key: "createdAt", title: "Date" },
    {
      align: "right",
      key: "actions",
      // No dataIndex — `value` is `undefined`, pull from `record` instead.
      render: (_value, record) => (
        <Button
          onClick={() => setViewing(record.id)}
          size="sm"
          variant="outline"
        >
          View
        </Button>
      ),
      title: "Actions",
    },
  ]);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        {viewing ? `Viewing ${viewing}` : "Click a row's View button"}
      </p>
      <div className="rounded-md border">
        <Table
          aria-label="Recent orders"
          columns={columns}
          dataSource={data}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default Demo;
