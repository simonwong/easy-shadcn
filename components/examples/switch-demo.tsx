"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/registry/ui/switch";

const Demo = () => {
  const [controlled, setControlled] = useState(false);
  const [submitted, setSubmitted] = useState("not submitted");

  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <section className="space-y-3">
        <h3 className="font-medium text-sm">Basic</h3>
        <Switch label="Product updates" />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">With description</h3>
        <Switch
          description="Receive a concise weekly summary."
          label="Weekly summary"
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Controlled</h3>
        <Switch
          checked={controlled}
          label="Team availability"
          onCheckedChange={setControlled}
        />
        <p
          aria-live="polite"
          className="text-muted-foreground text-xs"
          role="status"
        >
          Controlled value: {controlled ? "on" : "off"}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">States</h3>
        <div className="space-y-3">
          <Switch disabled label="Disabled option" />
          <Switch defaultChecked label="Read-only option" readOnly />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Sizes</h3>
        <div className="space-y-3">
          <Switch label="Small switch" size="sm" />
          <Switch label="Default switch" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Native form</h3>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setSubmitted(String(data.get("digest") ?? "missing"));
          }}
        >
          <Switch
            defaultChecked
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
