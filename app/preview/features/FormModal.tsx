"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/registry/ui/modal";

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  remark: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const FormModal = CommandModal.create(
  ({ defaultValues }: { defaultValues?: Partial<FormData> }) => {
    const modal = CommandModal.useModal();

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: defaultValues?.username ?? "",
        email: defaultValues?.email ?? "",
        remark: defaultValues?.remark ?? "",
      },
    });

    const onSubmit = async (data: FormData) => {
      // Simulate async submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      modal.resolve(data);
      modal.hide();
    };

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
            <Button onClick={() => modal.hide()} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={form.formState.isSubmitting}
              form="form-modal"
              type="submit"
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        }
        title="User Information Form"
      >
        <Form {...form}>
          <form
            className="space-y-4"
            id="form-modal"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Please enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please enter email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Please enter remarks" {...field} />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Modal>
    );
  }
);
