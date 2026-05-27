import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import htmlhint from "htmlhint";

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, ".htmlhintrc"), "utf8"));
const { HTMLHint } = htmlhint;

const files = (await readdir(root))
  .filter((file) => file.endsWith(".html"))
  .sort();

let issueCount = 0;

for (const file of files) {
  const html = await readFile(path.join(root, file), "utf8");
  const messages = HTMLHint.verify(html, config);

  for (const message of messages) {
    issueCount += 1;
    console.error(
      `${file}:${message.line}:${message.col} ${message.type.toUpperCase()} ${message.message}`
    );
  }
}

if (issueCount > 0) {
  console.error(`HTML lint failed with ${issueCount} issue${issueCount === 1 ? "" : "s"}.`);
  process.exit(1);
}

console.log(`Scanned ${files.length} files, no errors found.`);
