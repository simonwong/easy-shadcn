"use client";

import { useState } from "react";
import { InputGroupButton } from "@/components/ui/input-group";
import { Field } from "@/registry/ui/field";
import { InputGroup } from "@/registry/ui/input-group";

const Demo = () => {
  const [controlledValue, setControlledValue] = useState("draft");
  const [invited, setInvited] = useState(false);

  return (
    <div className="w-full max-w-md space-y-5">
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="input-group-basic">
          Username
        </label>
        <InputGroup
          autoComplete="username"
          id="input-group-basic"
          placeholder="ada-lovelace"
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="input-group-amount">
          Amount in US dollars
        </label>
        <InputGroup
          id="input-group-amount"
          inputMode="decimal"
          placeholder="0.00"
          startAddon="$"
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="input-group-weight">
          Weight in kilograms
        </label>
        <InputGroup
          endAddon="kg"
          id="input-group-weight"
          inputMode="decimal"
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="input-group-domain">
          HTTPS .com domain
        </label>
        <InputGroup
          endAddon=".com"
          id="input-group-domain"
          placeholder="example"
          startAddon="https://"
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="input-group-invitee">
          Invitee
        </label>
        <InputGroup
          endAddon={
            <InputGroupButton onClick={() => setInvited(true)} type="button">
              Invite
            </InputGroupButton>
          }
          id="input-group-invitee"
          placeholder="teammate@example.com"
          type="email"
        />
        <p
          aria-live="polite"
          className="text-muted-foreground text-sm"
          role="status"
        >
          {invited ? "Invitation queued." : "No invitation queued."}
        </p>
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="input-group-controlled">
          Controlled value
        </label>
        <InputGroup
          id="input-group-controlled"
          onChange={(event) => setControlledValue(event.currentTarget.value)}
          value={controlledValue}
        />
        <p className="text-muted-foreground text-sm">
          Current value: {controlledValue || "Empty"}
        </p>
      </div>

      <Field
        description="Used if you lose access to your primary account."
        error="Use a work email address."
        label="Recovery email"
      >
        <InputGroup defaultValue="ada@example" type="email" />
      </Field>
    </div>
  );
};

export default Demo;
