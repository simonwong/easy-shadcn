/** biome-ignore-all lint/correctness/noChildrenProp: <explanation> */
"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { AlertModal, Modal } from "@/registry/ui/modal";

type FormData = z.infer<typeof formSchema>;

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
});

export const FormModal = CommandModal.create(
  ({ defaultValues }: { defaultValues?: Partial<FormData> }) => {
    const modal = CommandModal.useModal();

    const form = useForm({
      defaultValues,
      validators: {
        onSubmit: formSchema,
      },
      onSubmit: async ({ value }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await AlertModal.alert({
          title: "Form submitted",
          description: (
            <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
              <code>{JSON.stringify(value, null, 2)}</code>
            </pre>
          ),
        });
        modal.resolve(value);
        modal.hide();
      },
    });

    useEffect(() => {
      if (!modal.modalProps.open) {
        form.reset();
      }
    }, [form.reset, modal.modalProps.open]);

    return (
      <Modal
        {...modal.modalProps}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                form.reset();
                modal.hide();
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={form.state.isSubmitting}
              form="form-modal"
              type="submit"
            >
              {form.state.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        }
        title="User Information Form"
      >
        <form
          className="space-y-4"
          id="form-modal"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Login button not working on mobile"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="title"
            />
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        aria-invalid={isInvalid}
                        className="min-h-24 resize-none"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="I'm having an issue with the login button on mobile."
                        rows={6}
                        value={field.state.value}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value?.length}/100 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Include steps to reproduce, expected behavior, and what
                      actually happened.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="description"
            />
          </FieldGroup>
        </form>
      </Modal>
    );
  }
);
