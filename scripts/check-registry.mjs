import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const run = (command, args, cwd = root) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))
    );
  });
const registry = JSON.parse(await readFile("registry.json", "utf8"));
const built = new Map();
for (const item of registry.items) {
  const output = JSON.parse(
    await readFile(`public/r/${item.name}.json`, "utf8")
  );
  for (const file of item.files) {
    assert.equal(
      output.files.find((candidate) => candidate.path === file.path)?.content,
      await readFile(file.path, "utf8"),
      `Generated registry drift: ${file.path}`
    );
  }
  built.set(`/${item.name}.json`, output);
}
const consumer = await mkdtemp(path.join(tmpdir(), "easy-shadcn-consumer-"));
const server = createServer((request, response) => {
  const item = built.get(request.url);
  response.writeHead(item ? 200 : 404, { "Content-Type": "application/json" });
  response.end(JSON.stringify(item ?? { error: "Unknown registry item" }));
});
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  await mkdir(path.join(consumer, "app"));
  await mkdir(path.join(consumer, "lib"));
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  const packed = JSON.parse(
    execFileSync("pnpm", ["pack", "--json", "--pack-destination", consumer], {
      cwd: path.join(root, "packages/command-modal"),
      encoding: "utf8",
    })
  );
  await writeFile(
    path.join(consumer, "package.json"),
    JSON.stringify({
      name: "registry-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@easy-shadcn/command-modal": `file:${packed.filename}`,
        react: manifest.dependencies.react,
        "react-dom": manifest.dependencies["react-dom"],
        clsx: manifest.dependencies.clsx,
        "class-variance-authority":
          manifest.dependencies["class-variance-authority"],
        "tailwind-merge": manifest.dependencies["tailwind-merge"],
      },
      devDependencies: {
        "@types/node": manifest.devDependencies["@types/node"],
        typescript: manifest.devDependencies.typescript,
        "@types/react": manifest.devDependencies["@types/react"],
        "@types/react-dom": manifest.devDependencies["@types/react-dom"],
        tailwindcss: manifest.devDependencies.tailwindcss,
      },
    })
  );
  const config = JSON.parse(await readFile("components.json", "utf8"));
  config.registries = { "@easy-shadcn": `${origin}/{name}.json` };
  await writeFile(
    path.join(consumer, "components.json"),
    JSON.stringify(config)
  );
  await writeFile(
    path.join(consumer, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        types: ["node", "react", "react-dom"],
        noEmit: true,
        skipLibCheck: true,
        jsx: "react-jsx",
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        paths: { "@/*": ["./*"] },
      },
      include: ["**/*.ts", "**/*.tsx"],
    })
  );
  await writeFile(
    path.join(consumer, "app/globals.css"),
    '@import "tailwindcss";\n'
  );
  await writeFile(
    path.join(consumer, "lib/utils.ts"),
    await readFile("lib/utils.ts")
  );
  await run("pnpm", ["install", "--ignore-scripts"], consumer);
  await run(path.join(root, "node_modules/.bin/shadcn"), [
    "add",
    ...registry.items.map((item) => `@easy-shadcn/${item.name}`),
    "--yes",
    "--overwrite",
    "--cwd",
    consumer,
  ]);
  await run("pnpm", ["exec", "tsc", "--noEmit"], consumer);
  console.log(
    `Fresh shadcn consumer installed and typechecked ${registry.items.length} registry entries.`
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(consumer, { recursive: true, force: true });
}
