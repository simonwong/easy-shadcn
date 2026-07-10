import { readFileSync } from "node:fs";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only @types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Alert } from "./alert";

const BROWSER_API_PATTERN = /\b(?:document|navigator|window)\b/;
const CLIENT_DIRECTIVE_PATTERN = /^["']use client["'];?/m;
const IMPORT_SPECIFIER_PATTERN = /from\s+["']([^"']+)["']/g;
const REACT_HOOK_PATTERN =
  /\buse(?:Callback|Effect|LayoutEffect|Memo|Reducer|Ref|State)\b/;
const SERVER_SAFE_IMPORTS = [
  "@/components/ui/alert",
  "@/lib/utils",
  "clsx",
  "react",
];

describe("Alert server compatibility", () => {
  it("renders without a browser environment", () => {
    const markup = renderToStaticMarkup(
      <Alert description="Available now." title="Server rendered" />
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Server rendered");
    expect(markup).toContain("Available now.");
  });

  it("keeps the module free of client-only directives and APIs", () => {
    const source = readFileSync("registry/ui/alert.tsx", "utf8");

    expect(source).not.toMatch(CLIENT_DIRECTIVE_PATTERN);
    expect(source).not.toMatch(REACT_HOOK_PATTERN);
    expect(source).not.toMatch(BROWSER_API_PATTERN);
    const imports = Array.from(
      source.matchAll(IMPORT_SPECIFIER_PATTERN),
      (match) => match[1]
    );
    expect(imports.toSorted()).toEqual(SERVER_SAFE_IMPORTS);
  });
});
