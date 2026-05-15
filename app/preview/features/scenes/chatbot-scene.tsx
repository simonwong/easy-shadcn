"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AsyncButton } from "@/registry/ui/async-button";
import { Card } from "@/registry/ui/card";
import { Select, type SelectItem } from "@/registry/ui/select";

interface Message {
  content: string;
  id: string;
  role: "assistant" | "user";
}

const MODELS: SelectItem[] = [
  { label: "Claude Opus 4.7 · 1M", value: "claude-opus-4-7" },
  { label: "Claude Sonnet 4.6", value: "claude-sonnet-4-6" },
  { label: "Claude Haiku 4.5", value: "claude-haiku-4-5" },
  { label: "GPT-4o", value: "gpt-4o" },
];

const SEED: Message[] = [
  {
    content:
      "Hi — I'm an AsyncButton with a 1.5s setTimeout pretending to be an LLM. Try me.",
    id: "seed-a",
    role: "assistant",
  },
  {
    content: "What does AsyncButton actually buy me here?",
    id: "seed-b",
    role: "user",
  },
  {
    content:
      "A Promise-aware onClick: I show a spinner the whole time it's pending, never twice, never half. Then I let go.",
    id: "seed-c",
    role: "assistant",
  },
];

function truncate(text: string, max = 80) {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}…`;
}

export function ChatbotScene() {
  const [model, setModel] = useState<string | undefined>("claude-opus-4-7");
  const [draft, setDraft] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(SEED);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    const userId = `u-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { content: text, id: userId, role: "user" },
    ]);
    setDraft("");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setMessages((prev) => [
      ...prev,
      {
        content: `[${model ?? "no-model"}] You said: "${truncate(text)}". Here's a perfectly canned reply that pretends to think for 1.5 seconds before answering.`,
        id: `a-${Date.now()}`,
        role: "assistant",
      },
    ]);
  };

  return (
    <Card
      action={
        <Select
          className="w-56"
          items={MODELS}
          onValueChange={(value) =>
            setModel(typeof value === "string" ? value : undefined)
          }
          value={model}
        />
      }
      description="A composer wired straight to AsyncButton. Latency stays honest — no fake instant reply."
      title="Chat"
    >
      <div className="flex max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((m) => (
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed",
              m.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-muted text-foreground"
            )}
            key={m.id}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-end gap-2 border-border border-t pt-4">
        <Textarea
          className="flex-1 resize-none"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message — I'll think for 1.5s."
          rows={2}
          value={draft}
        />
        <AsyncButton disabled={draft.trim().length === 0} onClick={handleSend}>
          Send
        </AsyncButton>
      </div>
    </Card>
  );
}
