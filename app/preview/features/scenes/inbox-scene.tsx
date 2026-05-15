"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AsyncButton } from "@/registry/ui/async-button";
import { Card } from "@/registry/ui/card";
import { DatePicker } from "@/registry/ui/date-picker";
import { Modal } from "@/registry/ui/modal";
import { Select, type SelectItem } from "@/registry/ui/select";

const CONTACTS: SelectItem[] = [
  { label: "Alice Wong · alice@example.com", value: "alice" },
  { label: "Bob Chen · bob@example.com", value: "bob" },
  { label: "Cynthia Park · cynthia@example.com", value: "cynthia" },
  { label: "Daniel Reyes · daniel@example.com", value: "daniel" },
  { label: "Eve Tanaka · eve@example.com", value: "eve" },
  { label: "Frank Liu · frank@example.com", value: "frank" },
  { label: "Greta Holm · greta@example.com", value: "greta" },
  { label: "Hiro Sato · hiro@example.com", value: "hiro" },
];

interface SendSuccessProps {
  recipientLabels: string[];
  scheduledLabel: string;
  subject: string;
}

const SendSuccessModal = CommandModal.create(
  ({ recipientLabels, scheduledLabel, subject }: SendSuccessProps) => {
    const modal = CommandModal.useModal();
    return (
      <Modal
        {...modal.modalProps}
        description="Tracked by the local mailroom — no servers were emailed in the making of this preview."
        footer={
          <Button onClick={() => modal.hide()} type="button">
            Close
          </Button>
        }
        title="Message queued"
      >
        <dl className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">To</dt>
          <dd className="font-medium">{recipientLabels.join(", ")}</dd>
          <dt className="text-muted-foreground">Subject</dt>
          <dd className="font-medium">{subject}</dd>
          <dt className="text-muted-foreground">Send</dt>
          <dd className="font-medium">{scheduledLabel}</dd>
        </dl>
      </Modal>
    );
  }
);

function FormRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[5.5rem_1fr] sm:gap-4">
      <span className="pt-1.5 font-medium text-muted-foreground text-sm">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function InboxScene() {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
  const [body, setBody] = useState<string>("");

  const canSend = recipients.length > 0 && subject.trim().length > 0;

  return (
    <Card
      description="Draft, schedule, send — assembled from one Card and a handful of compose-layer parts."
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button type="button" variant="ghost">
            Save draft
          </Button>
          <AsyncButton
            disabled={!canSend}
            onClick={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              CommandModal.show(SendSuccessModal, {
                recipientLabels: recipients.map(
                  (value) =>
                    (CONTACTS.find((c) => c.value === value)
                      ?.label as string) ?? value
                ),
                scheduledLabel: scheduledAt
                  ? format(scheduledAt, "PPP")
                  : "Immediately",
                subject: subject.trim(),
              });
            }}
          >
            Send →
          </AsyncButton>
        </div>
      }
      title="New message"
    >
      <div className="grid gap-5">
        <FormRow label="To">
          <Select
            items={CONTACTS}
            multiple
            onValueChange={(value) => {
              setRecipients(Array.isArray(value) ? value : []);
            }}
            placeholder="Pick one or more recipients"
            value={recipients}
          />
        </FormRow>
        <FormRow label="Subject">
          <Input
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Q3 retro · draft for review"
            value={subject}
          />
        </FormRow>
        <FormRow label="Schedule">
          <DatePicker
            mode="single"
            onChange={setScheduledAt}
            placeholder="Send immediately"
            value={scheduledAt}
          />
        </FormRow>
        <FormRow label="Body">
          <Textarea
            onChange={(event) => setBody(event.target.value)}
            placeholder="The team shipped eight features this quarter. Here's how each landed…"
            rows={6}
            value={body}
          />
        </FormRow>
      </div>
    </Card>
  );
}
