import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const copyableExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".pdf",
  ".docx",
  ".xlsx",
  ".txt",
  ".xml"
]);

const copyableDirectories = new Set(["docs"]);
const copyableFiles = new Set(["_headers", "CNAME", "robots.txt", "sitemap.xml"]);
const ignoredFiles = [
  /^audit-.*\.(png|jpg|jpeg)$/i,
  /^homepage-preview\.png$/i,
  /^logo\.png$/i,
  /^ndis-logo\.jpg$/i
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of await readdir(root)) {
  if (entry.startsWith(".") || entry === "dist" || entry === "node_modules" || entry === "scripts" || entry === "tests") {
    continue;
  }

  const source = path.join(root, entry);
  const target = path.join(dist, entry);
  const info = await stat(source);

  if (ignoredFiles.some((pattern) => pattern.test(entry))) {
    continue;
  }

  if (info.isDirectory()) {
    if (copyableDirectories.has(entry)) {
      await cp(source, target, { recursive: true });
    }
    continue;
  }

  if (copyableFiles.has(entry) || copyableExtensions.has(path.extname(entry))) {
    await cp(source, target);
  }
}

await writeFile(path.join(dist, ".nojekyll"), "");
