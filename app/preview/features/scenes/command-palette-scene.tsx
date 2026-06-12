"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { Button } from "@/components/ui/button";
import { Modal } from "@/registry/ui/modal";
import { Select, type SelectItem } from "@/registry/ui/select";
import { Tabs } from "@/registry/ui/tabs";

const FILES: SelectItem[] = [
  { label: "Quarterly report — Q3.pdf", value: "f-1" },
  { label: "Brand guidelines.fig", value: "f-2" },
  { label: "Onboarding deck.key", value: "f-3" },
  { label: "Engineering roadmap.md", value: "f-4" },
  { label: "Customer interviews.txt", value: "f-5" },
  { label: "Q3 budget.xlsx", value: "f-6" },
  { label: "API audit notes.md", value: "f-7" },
  { label: "Pricing v2 spec.pdf", value: "f-8" },
];

const PEOPLE: SelectItem[] = [
  { label: "Alice Wong · Design", value: "p-1" },
  { label: "Bob Chen · Platform", value: "p-2" },
  { label: "Cynthia Park · Frontend", value: "p-3" },
  { label: "Daniel Reyes · DX", value: "p-4" },
  { label: "Eve Tanaka · Docs", value: "p-5" },
  { label: "Frank Liu · Research", value: "p-6" },
];

const ACTIONS: SelectItem[] = [
  { label: "Toggle theme", value: "a-1" },
  { label: "Open docs", value: "a-2" },
  { label: "Copy install snippet", value: "a-3" },
  { label: "Star on GitHub", value: "a-4" },
  { label: "Report an issue", value: "a-5" },
];

function buildLoader(items: SelectItem[]) {
  return (_query: string, signal: AbortSignal) =>
    new Promise<SelectItem[]>((resolve, reject) => {
      const timer = setTimeout(() => resolve(items), 350);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
}

const PaletteModal = CommandModal.create(() => {
  const modal = CommandModal.useModal();
  return (
    <Modal
      {...modal.modalProps}
      contentClassName="space-y-3"
      className="sm:max-w-2xl"
      description="One palette, three sources. Each tab keeps its query when you switch — that's keepMounted earning its place."
      title="Quick switch"
    >
      <Tabs
        defaultValue="files"
        items={[
          {
            content: (
              <Select
                loadItems={buildLoader(FILES)}
                placeholder="Find a file…"
                searchable
                serverSideFilter
              />
            ),
            keepMounted: true,
            label: "Files",
            value: "files",
          },
          {
            content: (
              <Select
                loadItems={buildLoader(PEOPLE)}
                placeholder="Find a teammate…"
                searchable
                serverSideFilter
              />
            ),
            keepMounted: true,
            label: "People",
            value: "people",
          },
          {
            content: (
              <Select
                loadItems={buildLoader(ACTIONS)}
                placeholder="Run an action…"
                searchable
                serverSideFilter
              />
            ),
            keepMounted: true,
            label: "Actions",
            value: "actions",
          },
        ]}
      />
    </Modal>
  );
});

export function CommandPaletteScene() {
  return (
    <div className="flex flex-col items-center gap-5">
      <Button
        className="w-full max-w-md justify-between rounded-lg text-muted-foreground"
        onClick={() => CommandModal.show(PaletteModal, {})}
        type="button"
        variant="outline"
      >
        <span className="inline-flex items-center gap-2">
          <span aria-hidden>⌘</span>
          <span>Quick switch — files, people, actions</span>
        </span>
        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground">
          ⌘K
        </kbd>
      </Button>
      <p className="max-w-md text-center text-muted-foreground text-xs">
        Click to open. Type in one tab, switch tabs, switch back — the query
        survives because the Tabs are kept mounted.
      </p>
    </div>
  );
}
