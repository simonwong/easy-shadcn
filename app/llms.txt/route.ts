import { llms } from "fumadocs-core/source";
import { source } from "@/lib/source";

// cached forever
export const revalidate = false;

export function GET() {
  return new Response(llms(source).index(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
