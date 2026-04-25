import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

// Keep JS minification conservative so we do not risk altering template strings.
function minifyJs(source) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function writeMinified(sourceName, minifiedName, transform) {
  const sourcePath = path.join(root, sourceName);
  const minifiedPath = path.join(root, minifiedName);
  const source = await readFile(sourcePath, "utf8");
  await writeFile(minifiedPath, `${transform(source)}\n`);
}

await writeMinified("styles.css", "styles.min.css", minifyCss);
await writeMinified("forms.js", "forms.min.js", minifyJs);
await writeMinified("site-config.js", "site-config.min.js", minifyJs);
