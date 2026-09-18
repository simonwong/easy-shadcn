import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const consumer = mkdtempSync(path.join(tmpdir(), "command-modal-consumer-"));
try {
  const packed = JSON.parse(
    execFileSync("pnpm", ["pack", "--json", "--pack-destination", consumer], {
      cwd: path.join(root, "packages/command-modal"),
      encoding: "utf8",
    })
  );
  const target = path.join(consumer, "node_modules/@easy-shadcn/command-modal");
  mkdirSync(target, { recursive: true });
  execFileSync("tar", [
    "-xzf",
    packed.filename,
    "--strip-components=1",
    "-C",
    target,
  ]);
  for (const dependency of ["react", "@types"]) {
    symlinkSync(
      path.join(root, "node_modules", dependency),
      path.join(consumer, "node_modules", dependency),
      "dir"
    );
  }
  writeFileSync(
    path.join(consumer, "package.json"),
    JSON.stringify({ type: "module" })
  );
  for (const extension of ["cjs", "mjs"]) {
    const imports =
      extension === "cjs"
        ? 'const modal = require("@easy-shadcn/command-modal"); const antd = require("@easy-shadcn/command-modal/antd");'
        : 'import * as modal from "@easy-shadcn/command-modal"; import * as antd from "@easy-shadcn/command-modal/antd";';
    const fixture = path.join(consumer, `check.${extension}`);
    writeFileSync(
      fixture,
      `${imports}\nif (typeof modal.show !== "function" || typeof antd.antdModalProps !== "function") { throw new Error("Missing package exports"); }\n`
    );
    execFileSync(process.execPath, [fixture], { stdio: "inherit" });
  }
  const typeFixture = `import { create, show } from "@easy-shadcn/command-modal";
import { antdModalProps } from "@easy-shadcn/command-modal/antd";
const Modal = create<Record<string, never>, { name: string }>(() => null);
const result: Promise<{ name: string } | undefined> = show(Modal);
// @ts-expect-error Dismissal returns undefined.
const unsafe: Promise<{ name: string }> = show(Modal);
const adapter: typeof antdModalProps = antdModalProps;
void result; void unsafe; void adapter;
`;
  for (const extension of ["mts", "cts"]) {
    writeFileSync(path.join(consumer, `check.${extension}`), typeFixture);
  }
  execFileSync(
    path.join(root, "node_modules/.bin/tsc"),
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--target",
      "ES2020",
      path.join(consumer, "check.mts"),
      path.join(consumer, "check.cts"),
    ],
    { stdio: "inherit", cwd: consumer }
  );
  const manifest = JSON.parse(
    readFileSync(path.join(target, "package.json"), "utf8")
  );
  assert.equal(manifest.name, "@easy-shadcn/command-modal");
  console.log(
    "Packed ESM/CommonJS main, antd, and TypeScript consumers passed."
  );
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
