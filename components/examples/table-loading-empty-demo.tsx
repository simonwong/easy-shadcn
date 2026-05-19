import { useState } from "react";
import { Button } from "@/components/ui/button";
import { defineColumns, Table } from "@/registry/ui/table";

interface Row {
  id: string;
  owner: string;
  task: string;
}

const sample: Row[] = [
  { id: "t1", owner: "Ada", task: "Design table API" },
  { id: "t2", owner: "Linus", task: "Ship docs" },
];

const columns = defineColumns<Row>()([
  { dataIndex: "task", key: "task", title: "Task" },
  { dataIndex: "owner", key: "owner", title: "Owner" },
]);

type Mode = "data" | "loading" | "empty";

const Demo = () => {
  const [mode, setMode] = useState<Mode>("data");
  const dataSource = mode === "data" ? sample : [];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={() => setMode("data")}
          size="sm"
          variant={mode === "data" ? "default" : "outline"}
        >
          With data
        </Button>
        <Button
          onClick={() => setMode("loading")}
          size="sm"
          variant={mode === "loading" ? "default" : "outline"}
        >
          Loading
        </Button>
        <Button
          onClick={() => setMode("empty")}
          size="sm"
          variant={mode === "empty" ? "default" : "outline"}
        >
          Empty
        </Button>
      </div>
      <div className="rounded-md border">
        <Table
          caption="Sprint backlog"
          columns={columns}
          dataSource={dataSource}
          emptyMessage="Nothing to do — go outside."
          loading={mode === "loading"}
          loadingMessage="Fetching tasks…"
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default Demo;
