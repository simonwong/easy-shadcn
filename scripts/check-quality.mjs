import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const SOURCE_FILE = /\.(?:[cm]?[jt]sx?|jsonc?)$/;
const EXCLUDED = /^(?:components\/ui\/|public\/r\/|\.agents\/|\.codex\/)/;
const MODULE_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)["']([^"']+)["']/gm;
const VERSION_SUFFIX = /(?<=.)@.*$/;
// Every shadcn consumer already has these; items need not declare them.
const HOST_PACKAGES = new Set(["react", "react-dom"]);

const toPackageName = (specifier) => {
  const segments = specifier.split("/");
  return specifier.startsWith("@")
    ? segments.slice(0, 2).join("/")
    : segments[0];
};

const isBareModule = (specifier) =>
  !(
    specifier.startsWith(".") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("node:")
  );

// Registry files are copied into consumer projects, so every npm package they
// import must be declared on the item rather than arrive transitively.
const findUndeclaredDependencies = () => {
  const registry = JSON.parse(readFileSync("registry.json", "utf8"));
  const problems = [];

  for (const item of registry.items) {
    const declared = new Set(
      (item.dependencies ?? []).map((dependency) =>
        toPackageName(dependency.replace(VERSION_SUFFIX, ""))
      )
    );
    const imported = new Set();

    for (const file of item.files) {
      const source = readFileSync(file.path, "utf8");
      for (const [, specifier] of source.matchAll(MODULE_SPECIFIER)) {
        if (isBareModule(specifier)) {
          imported.add(toPackageName(specifier));
        }
      }
    }

    for (const name of imported) {
      if (!(HOST_PACKAGES.has(name) || declared.has(name))) {
        problems.push(`${item.name}: imports "${name}" without declaring it`);
      }
    }
  }

  return problems;
};

const undeclared = findUndeclaredDependencies();
if (undeclared.length > 0) {
  console.error(
    `registry.json dependencies are incomplete:\n  ${undeclared.join("\n  ")}`
  );
  process.exit(1);
}

const paths = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" }
)
  .split("\0")
  .filter(
    (file) =>
      existsSync(file) &&
      SOURCE_FILE.test(file) &&
      !EXCLUDED.test(file) &&
      file !== "components/examples/index.tsx"
  );

execFileSync("pnpm", ["exec", "ultracite", "check", ...new Set(paths)], {
  stdio: "inherit",
});
