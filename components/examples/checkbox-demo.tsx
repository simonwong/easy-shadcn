"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";

const Demo = () => {
  const [controlled, setControlled] = useState(false);
  const [submitted, setSubmitted] = useState("not submitted");

  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <section className="space-y-3">
        <h3 className="font-medium text-sm">Basic</h3>
        <Checkbox label="Accept terms and conditions" />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">With description</h3>
        <Checkbox
          description="Receive a concise weekly summary."
          label="Weekly summary"
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Controlled</h3>
        <Checkbox
          checked={controlled}
          label="Team access"
          onCheckedChange={setControlled}
        />
        <p
          aria-live="polite"
          className="text-muted-foreground text-xs"
          role="status"
        >
          Controlled value: {controlled ? "checked" : "unchecked"}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">States</h3>
        <div className="space-y-3">
          <Checkbox disabled label="Disabled option" />
          <Checkbox defaultChecked label="Read-only option" readOnly />
        </div>
      </section>

      <section className="space-y-3 sm:col-span-2">
        <h3 className="font-medium text-sm">Native form</h3>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setSubmitted(String(data.get("digest") ?? "missing"));
          }}
        >
          <Checkbox
            label="Email digest"
            name="digest"
            uncheckedValue="disabled"
            value="enabled"
          />
          <Button size="sm" type="submit" variant="outline">
            Submit form
          </Button>
          <p
            aria-live="polite"
            className="text-muted-foreground text-xs"
            role="status"
          >
            Submitted value: {submitted}
          </p>
        </form>
      </section>
    </div>
  );
};

export default Demo;
