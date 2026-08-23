"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { InputOTP } from "@/registry/ui/input-otp";

const Demo = () => {
  const [value, setValue] = useState("");
  const [completed, setCompleted] = useState("");

  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-2">
        <label className="font-medium text-sm" htmlFor="verification-code">
          Verification code
        </label>
        <InputOTP
          aria-describedby="verification-help"
          groupSize={3}
          id="verification-code"
          maxLength={6}
          onChange={setValue}
          onComplete={setCompleted}
          pasteTransformer={(pasted) => pasted.replaceAll("-", "")}
          pattern={REGEXP_ONLY_DIGITS}
          placeholder="••••••"
          value={value}
        />
        <p className="text-muted-foreground text-sm" id="verification-help">
          Paste formats like 123-456. Value: {value || "Empty"}. Completed:{" "}
          {completed || "No"}.
        </p>
      </div>

      <InputOTP
        aria-invalid="true"
        aria-label="Invalid verification code"
        groupSize={3}
        maxLength={6}
        value="000000"
      />

      <InputOTP
        aria-label="Disabled verification code"
        disabled
        maxLength={4}
      />
    </div>
  );
};

export default Demo;
