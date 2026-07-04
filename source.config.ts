import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // Enables `page.data.getText("processed")` for llms-full.txt / raw markdown output.
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig();
