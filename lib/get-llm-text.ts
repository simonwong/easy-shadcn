import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/source";

/**
 * Format a single docs page as plain Markdown for LLM consumption.
 *
 * Requires `includeProcessedMarkdown` to be enabled in `source.config.ts`.
 */
export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
