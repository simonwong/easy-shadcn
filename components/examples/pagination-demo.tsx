"use client";

import { useState } from "react";
import { Pagination } from "@/registry/ui/pagination";

const Demo = () => {
  const [controlledValue, setControlledValue] = useState(4);
  const [lastUncontrolledValue, setLastUncontrolledValue] = useState(3);

  return (
    <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
      <section className="space-y-3">
        <h3 className="font-medium text-sm">Client controlled</h3>
        <Pagination
          aria-label="Controlled result pages"
          onValueChange={setControlledValue}
          total={96}
          value={controlledValue}
        />
        <p className="text-center text-muted-foreground text-xs">
          Current page: {controlledValue}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Client uncontrolled</h3>
        <Pagination
          aria-label="Uncontrolled result pages"
          defaultValue={3}
          onValueChange={setLastUncontrolledValue}
          total={72}
        />
        <p className="text-center text-muted-foreground text-xs">
          Last reported page: {lastUncontrolledValue}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Route navigation</h3>
        <Pagination
          aria-label="Report route pages"
          getPageHref={(page) => `/docs/components/pagination?page=${page}`}
          total={120}
          value={6}
        />
        <p className="text-center text-muted-foreground text-xs">
          Genuine links preserve native browser navigation.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Compact range</h3>
        <Pagination
          aria-label="Compact result pages"
          boundaryCount={2}
          onValueChange={() => undefined}
          siblingCount={0}
          total={1000}
          value={50}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Disabled</h3>
        <Pagination
          aria-label="Disabled result pages"
          defaultValue={2}
          disabled
          onValueChange={() => undefined}
          total={50}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Presentation</h3>
        <Pagination
          aria-label="Styled result pages"
          contentClassName="rounded-xl border bg-muted/30 p-1"
          linkClassName="rounded-full"
          nextClassName="text-primary"
          onValueChange={() => undefined}
          previousClassName="text-primary"
          total={80}
          value={4}
        />
      </section>
    </div>
  );
};

export default Demo;
