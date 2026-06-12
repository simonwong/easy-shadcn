"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { AsyncButton } from "@/registry/ui/async-button";
import { Field } from "@/registry/ui/field";

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const schema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type FormValues = z.infer<typeof schema>;

const Demo = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: standardSchemaResolver(schema) });

  return (
    <form
      className="w-full max-w-md space-y-5"
      noValidate
      onSubmit={handleSubmit(() => wait(800))}
    >
      <Field error={errors.email?.message} label="Email" required>
        <Input
          placeholder="ada@example.com"
          type="email"
          {...register("email")}
        />
      </Field>

      <Field
        description="At least 8 characters."
        error={errors.password?.message}
        label="Password"
        required
      >
        <Input type="password" {...register("password")} />
      </Field>

      <AsyncButton loading={isSubmitting} type="submit">
        Create account
      </AsyncButton>
    </form>
  );
};

export default Demo;
