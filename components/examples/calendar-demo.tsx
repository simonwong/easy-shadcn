"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/registry/ui/calendar";

const Demo = () => {
  const [single, setSingle] = useState<Date | undefined>();
  const [monthsDate, setMonthsDate] = useState<Date | undefined>();
  const [yearsDate, setYearsDate] = useState<Date | undefined>();
  const [multiple, setMultiple] = useState<Date[] | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Days view — click month or year in the caption
        </span>
        <Calendar mode="single" onSelect={setSingle} selected={single} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Months view (defaultView=&quot;months&quot;)
        </span>
        <Calendar
          defaultView="months"
          mode="single"
          onSelect={setMonthsDate}
          selected={monthsDate}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Years view (defaultView=&quot;years&quot;)
        </span>
        <Calendar
          defaultView="years"
          mode="single"
          onSelect={setYearsDate}
          selected={yearsDate}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Multiple — click multiple days to toggle selection
        </span>
        <Calendar mode="multiple" onSelect={setMultiple} selected={multiple} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Range — pick a start and end day
        </span>
        <Calendar mode="range" onSelect={setRange} selected={range} />
      </div>
    </div>
  );
};

export default Demo;
