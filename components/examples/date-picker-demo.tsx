"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DatePicker } from "@/registry/ui/date-picker";

const Demo = () => {
  const [single, setSingle] = useState<Date | undefined>();
  const [multiple, setMultiple] = useState<Date[] | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();
  const [typed, setTyped] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Single (default trigger, format=&quot;PPP&quot;)
        </span>
        <DatePicker onChange={setSingle} value={single} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Multiple (single panel, format=&quot;LLL dd, y&quot;)
        </span>
        <DatePicker
          format="LLL dd, y"
          mode="multiple"
          onChange={setMultiple}
          value={multiple}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Range (single panel, format=&quot;LLL dd, y&quot;)
        </span>
        <DatePicker
          format="LLL dd, y"
          mode="range"
          onChange={setRange}
          value={range}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          With input (format=&quot;yyyy-MM-dd&quot;)
        </span>
        <DatePicker
          format="yyyy-MM-dd"
          onChange={setTyped}
          value={typed}
          withInput
        />
      </div>
    </div>
  );
};

export default Demo;
