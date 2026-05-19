import fs from "node:fs/promises";
import path from "node:path";

const EXAMPLE_PATH = path.join(process.cwd(), "components/examples");
const exampleFileNames = await fs.readdir(EXAMPLE_PATH);

let contentStr = "";

for (const fileName of exampleFileNames) {
  if (fileName.endsWith(".tsx") && fileName !== "index.tsx") {
    const name = fileName.split(".")[0];
    const codeContent = await fs.readFile(path.join(EXAMPLE_PATH, fileName), {
      encoding: "utf-8",
    });
    contentStr += `
  "${name}": {
    component: React.lazy(() => import("./${name}")),
    codeString: ${JSON.stringify(codeContent)}
  },
`;
  }
}

const IndexFileContent = `
// generate this file by scripts/genarate-example-entry.mjs
import React from "react";

export default {${contentStr}} as const
`;

await fs.writeFile(path.join(EXAMPLE_PATH, "index.tsx"), IndexFileContent);
