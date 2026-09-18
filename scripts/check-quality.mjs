import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const SOURCE_FILE = /\.(?:[cm]?[jt]sx?|jsonc?)$/;
const EXCLUDED = /^(?:components\/ui\/|public\/r\/|\.agents\/|\.codex\/)/;

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
