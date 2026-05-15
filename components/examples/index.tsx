
// generate this file by scripts/genarate-example-entry.mjs
import React from "react";

export default {
  "async-button-demo": {
    component: React.lazy(() => import("./async-button-demo")),
    codeString: `"use client";

import {
  ArrowRightIcon,
  DownloadIcon,
  RefreshCwIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import { AsyncButton } from "@/registry/ui/async-button";

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const Demo = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Click the button — loading state activates automatically while the
        promise is pending.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(2000)}>Submit Order</AsyncButton>
        <AsyncButton onClick={() => wait(2000)} variant="outline">
          Sync Data
        </AsyncButton>
        <AsyncButton onClick={() => wait(2000)} variant="secondary">
          Export Report
        </AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Drive loading externally via the <code>loading</code> prop.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton loading>Controlled Loading</AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Use <code>startIcon</code> / <code>endIcon</code>. While loading, the
        icon slot is swapped for the spinner — no overlay needed. When both are
        present, <code>startIcon</code> takes the spinner.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(2000)} startIcon={<SendIcon />}>
          Send Message
        </AsyncButton>
        <AsyncButton
          endIcon={<ArrowRightIcon />}
          onClick={() => wait(2000)}
          variant="outline"
        >
          Continue
        </AsyncButton>
        <AsyncButton
          endIcon={<ArrowRightIcon />}
          onClick={() => wait(2000)}
          startIcon={<DownloadIcon />}
          variant="secondary"
        >
          Download &amp; Next
        </AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Icon buttons with <code>size="icon"</code>.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(2000)} size="icon">
          <SendIcon />
        </AsyncButton>
        <AsyncButton onClick={() => wait(2000)} size="icon" variant="outline">
          <RefreshCwIcon />
        </AsyncButton>
        <AsyncButton
          onClick={() => wait(2000)}
          size="icon"
          variant="destructive"
        >
          <Trash2Icon />
        </AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Anti-flash: a 50ms task still shows the spinner for at least 200ms (the
        default <code>minDuration</code>), so the indicator never just flickers
        past.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton onClick={() => wait(50)}>Fast Save (50ms)</AsyncButton>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Errors are caught and logged — the button recovers gracefully.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <AsyncButton
          onClick={() =>
            wait(1500).then(() => {
              throw new Error("Request failed");
            })
          }
          variant="destructive"
        >
          Simulate Failure
        </AsyncButton>
      </div>
    </div>
  </div>
);

export default Demo;
`
  },

  "calendar-demo": {
    component: React.lazy(() => import("./calendar-demo")),
    codeString: `"use client";

import { useState } from "react";
import { Calendar } from "@/registry/ui/calendar";

const Demo = () => {
  const [single, setSingle] = useState<Date | undefined>();
  const [monthsDate, setMonthsDate] = useState<Date | undefined>();
  const [yearsDate, setYearsDate] = useState<Date | undefined>();
  const [multiple, setMultiple] = useState<Date[] | undefined>();

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
    </div>
  );
};

export default Demo;
`
  },

  "card-demo": {
    component: React.lazy(() => import("./card-demo")),
    codeString: `import { AsyncButton } from "@/registry/ui/async-button";
import { Card } from "@/registry/ui/card";

const Demo = () => (
  <div className="space-y-4">
    <Card
      action={<AsyncButton variant="outline">More</AsyncButton>}
      className="w-128"
      description="some descriptions"
      footer={<AsyncButton>Button</AsyncButton>}
      footerClassName="flex justify-end"
      title="Default Card"
    >
      <div>
        <div>No dividers</div>
        <div>No dividers</div>
        <div>No dividers</div>
      </div>
    </Card>

    <Card
      className="w-72"
      contentClassName="bg-white"
      description="using className"
      descriptionClassName="text-gray-500"
      dividers
      footer="Custom Card Footer"
      size="sm"
      title="Small Card"
    >
      <ul>
        <li>Size: sm</li>
        <li>dividers: true</li>
      </ul>
    </Card>
  </div>
);

export default Demo;
`
  },

  "date-picker-demo": {
    component: React.lazy(() => import("./date-picker-demo")),
    codeString: `"use client";

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
          With input — type a date and press Enter
        </span>
        <DatePicker onChange={setTyped} value={typed} withInput />
      </div>
    </div>
  );
};

export default Demo;
`
  },

  "modal-alert-demo": {
    component: React.lazy(() => import("./modal-alert-demo")),
    codeString: `import { AsyncButton } from "@/registry/ui/async-button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => (
  <div>
    <AlertModal
      description="Modal Content"
      title="Alert Title"
      trigger={<AsyncButton>Alert Modal</AsyncButton>}
    />
  </div>
);

export default Demo;
`
  },

  "modal-alert-helper-demo": {
    component: React.lazy(() => import("./modal-alert-helper-demo")),
    codeString: `import { AsyncButton } from "@/registry/ui/async-button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => (
  <div className="space-x-2">
    <AsyncButton
      onClick={() => {
        AlertModal.alert({
          title: "Tips",
          description: "Alert Content",
        });
      }}
    >
      Click Alert
    </AsyncButton>
    <AsyncButton
      onClick={() => {
        AlertModal.confirm({
          title: "Tips",
          description:
            "If onConfirm or onCancel is asynchronous events, the button will automatically display loading",
          onCancel: () => {
            console.log("cancel");
          },
          onConfirm: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                console.log("confirm");
                resolve();
              }, 1000);
            }),
        });
      }}
    >
      Click Confirm
    </AsyncButton>
    <AsyncButton
      onClick={async () => {
        await AlertModal.alert({
          title: "Tips1",
          description: "Alert Content-1",
        });
        await AlertModal.alert({
          title: "Tips2",
          description: "Alert Content-2",
        });
      }}
    >
      Alert Step by Step
    </AsyncButton>
    <AsyncButton
      onClick={async () => {
        await AlertModal.alert({
          title: "Tips1",
          description: (
            <div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
              <div>Alert Content-1</div>
            </div>
          ),
          onConfirm: async () => {
            await AlertModal.alert({
              title: "Tips1-1",
              description: "Alert Content-1-1",
            });
          },
        });
      }}
    >
      Alert Step In Step
    </AsyncButton>
  </div>
);

export default Demo;
`
  },

  "modal-demo": {
    component: React.lazy(() => import("./modal-demo")),
    codeString: `import { useState } from "react";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

const Demo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Modal
        footer={
          <div className="space-x-2">
            <AsyncButton
              onClick={() => {
                setShowModal(false);
              }}
              variant="ghost"
            >
              Cancel
            </AsyncButton>
            <AsyncButton>Save</AsyncButton>
          </div>
        }
        onOpenChange={setShowModal}
        open={showModal}
        title="Modal Title"
        trigger={<AsyncButton>Click Show Modal</AsyncButton>}
      >
        <div>Modal Content</div>
        <div>Modal Content</div>
        <div>Modal Content</div>
        <div>Modal Content</div>
      </Modal>
    </div>
  );
};

export default Demo;
`
  },

  "modal-helper-holder-demo": {
    component: React.lazy(() => import("./modal-helper-holder-demo")),
    codeString: `import { useRef, useState } from "react";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

const CommandModalModal = Modal.create(({ count }: { count: number }) => {
  const modal = Modal.useModal();

  return (
    <Modal
      {...modal.modalProps}
      footer={
        <div className="space-x-2">
          <AsyncButton
            onClick={() => {
              modal.hide();
            }}
            variant="ghost"
          >
            Cancel
          </AsyncButton>
          <AsyncButton>Save</AsyncButton>
        </div>
      }
      title="Modal Will Update by props"
    >
      <p>AnyModalContent: {count}</p>
      <p>Count will be updated in 1 second</p>
    </Modal>
  );
});

const Demo = () => {
  const [action, ModalHolder] = Modal.useModalHolder(CommandModalModal);

  const [count, setCount] = useState(0);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    countRef.current && clearInterval(countRef.current);
    action.show();

    countRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  return (
    <Modal.Provider>
      <AsyncButton onClick={handleClick}>Click Show Modal</AsyncButton>
      <p>Current Count: {count}</p>
      <ModalHolder count={count} />
    </Modal.Provider>
  );
};

export default Demo;
`
  },

  "select-async-demo": {
    component: React.lazy(() => import("./select-async-demo")),
    codeString: `"use client";

import { Select, type SelectItem } from "@/registry/ui/select";

const COUNTRIES: SelectItem[] = [
  { label: "Argentina", value: "ar" },
  { label: "Australia", value: "au" },
  { label: "Brazil", value: "br" },
  { label: "Canada", value: "ca" },
  { label: "China", value: "cn" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "India", value: "in" },
  { label: "Italy", value: "it" },
  { label: "Japan", value: "jp" },
  { label: "Mexico", value: "mx" },
  { label: "Netherlands", value: "nl" },
  { label: "Spain", value: "es" },
  { label: "United Kingdom", value: "uk" },
  { label: "United States", value: "us" },
];

const loadCountries = async (
  _query: string,
  signal: AbortSignal
): Promise<SelectItem[]> => {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 600);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
  return COUNTRIES;
};

const Demo = () => (
  <div className="w-64">
    <Select
      clearable
      loadItems={loadCountries}
      loadOn="open"
      placeholder="Search a country"
      searchable
    />
  </div>
);

export default Demo;
`
  },

  "select-demo": {
    component: React.lazy(() => import("./select-demo")),
    codeString: `import { Select } from "@/registry/ui/select";

const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Durian", value: "durian" },
  { label: "Elderberry", value: "elderberry" },
];

const Demo = () => (
  <div className="w-64">
    <Select items={items} placeholder="Pick a fruit" />
  </div>
);

export default Demo;
`
  },

  "select-multiple-demo": {
    component: React.lazy(() => import("./select-multiple-demo")),
    codeString: `import { Select } from "@/registry/ui/select";

const items = [
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "Ruby", value: "ruby" },
];

const Demo = () => (
  <div className="w-80">
    <Select items={items} multiple placeholder="Pick languages" />
  </div>
);

export default Demo;
`
  },

  "select-searchable-demo": {
    component: React.lazy(() => import("./select-searchable-demo")),
    codeString: `import { Select } from "@/registry/ui/select";

const items = [
  { label: "Afghanistan", value: "af" },
  { label: "Albania", value: "al" },
  { label: "Algeria", value: "dz" },
  { label: "Argentina", value: "ar" },
  { label: "Australia", value: "au" },
  { label: "Austria", value: "at" },
  { label: "Belgium", value: "be" },
  { label: "Brazil", value: "br" },
  { label: "Canada", value: "ca" },
  { label: "Chile", value: "cl" },
  { label: "China", value: "cn" },
  { label: "Colombia", value: "co" },
  { label: "Denmark", value: "dk" },
  { label: "Egypt", value: "eg" },
  { label: "Finland", value: "fi" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "Greece", value: "gr" },
  { label: "India", value: "in" },
  { label: "Indonesia", value: "id" },
  { label: "Italy", value: "it" },
  { label: "Japan", value: "jp" },
  { label: "Mexico", value: "mx" },
  { label: "Netherlands", value: "nl" },
  { label: "Norway", value: "no" },
  { label: "Poland", value: "pl" },
  { label: "Portugal", value: "pt" },
  { label: "Russia", value: "ru" },
  { label: "Spain", value: "es" },
  { label: "Sweden", value: "se" },
  { label: "Switzerland", value: "ch" },
  { label: "United Kingdom", value: "gb" },
  { label: "United States", value: "us" },
];

const Demo = () => (
  <div className="w-64">
    <Select clearable items={items} placeholder="Search a country" searchable />
  </div>
);

export default Demo;
`
  },

  "select-server-search-demo": {
    component: React.lazy(() => import("./select-server-search-demo")),
    codeString: `"use client";

import { useState } from "react";
import { Select, type SelectItem } from "@/registry/ui/select";

const USERS: SelectItem[] = [
  { label: "Ada Lovelace", value: "ada" },
  { label: "Alan Turing", value: "alan" },
  { label: "Barbara Liskov", value: "barbara" },
  { label: "Donald Knuth", value: "donald" },
  { label: "Edsger Dijkstra", value: "edsger" },
  { label: "Grace Hopper", value: "grace" },
  { label: "John von Neumann", value: "john" },
  { label: "Linus Torvalds", value: "linus" },
  { label: "Margaret Hamilton", value: "margaret" },
  { label: "Richard Stallman", value: "richard" },
  { label: "Tim Berners-Lee", value: "tim" },
  { label: "Yukihiro Matsumoto", value: "yukihiro" },
];

const searchUsers = async (
  query: string,
  signal: AbortSignal
): Promise<SelectItem[]> => {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 450);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
  const q = query.trim().toLowerCase();
  if (!q) {
    return USERS.slice(0, 6);
  }
  return USERS.filter((u) => String(u.label).toLowerCase().includes(q)).slice(
    0,
    8
  );
};

const Demo = () => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="flex w-72 flex-col gap-2">
      <Select
        debounceMs={250}
        loadItems={searchUsers}
        multiple
        onValueChange={(next) => setValue((next as string[]) ?? [])}
        placeholder="Search reviewers"
        serverSideFilter
        value={value}
      />
      <p className="text-muted-foreground text-xs">
        Selected:{" "}
        <code className="text-foreground">
          {value.length === 0 ? "—" : value.join(", ")}
        </code>
      </p>
    </div>
  );
};

export default Demo;
`
  },

  "tabs-demo": {
    component: React.lazy(() => import("./tabs-demo")),
    codeString: `import { Tabs } from "@/registry/ui/tabs";

const Demo = () => (
  <Tabs
    defaultValue="first"
    items={[
      {
        label: "First",
        value: "first",
        content: (
          <div className="rounded-2xl border bg-accent p-6">First Content</div>
        ),
      },
      {
        label: "Second",
        value: "second",
        content: (
          <div className="rounded-2xl border bg-accent-foreground p-6 text-accent">
            Second Content
          </div>
        ),
      },
    ]}
  />
);

export default Demo;
`
  },
} as const
