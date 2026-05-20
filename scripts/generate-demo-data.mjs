import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dataDir = path.join(root, "public", "data");
const files = ["members.json", "papers.json", "reading_logs.json", "site_config.json"];

await mkdir(dataDir, { recursive: true });
for (const fileName of files) {
  const filePath = path.join(dataDir, fileName);
  const json = JSON.parse(await readFile(filePath, "utf8"));
  await writeFile(filePath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
}

console.log("Demo data normalized in public/data.");
