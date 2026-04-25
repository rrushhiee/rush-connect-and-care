import { readFile } from "node:fs/promises";

const port = Number(process.env.PORT || 4173);
const resourcesHtml = await readFile("dist/resources.html", "utf8");
const matches = [...resourcesHtml.matchAll(/href="(docs\/[^"]+\.(?:pdf|docx|xlsx))"/g)];

if (matches.length === 0) {
  throw new Error("No PDF resource links were found in resources.html");
}

for (const match of matches) {
  const href = match[1];
  const response = await fetch(`http://127.0.0.1:${port}/${href}`);

  if (response.status !== 200) {
    throw new Error(`Expected ${href} to return 200, got ${response.status}`);
  }
}

console.log(`Verified ${matches.length} resource links returned status 200.`);
