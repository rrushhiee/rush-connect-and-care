import { createReadStream } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const port = Number(process.env.PORT || 4173);
const root = path.join(process.cwd(), "dist");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/__form_test__" && request.method === "POST") {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      sendJson(response, 200, { ok: true, received: body.length > 0 });
    });
    return;
  }

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.join(root, pathname);

  try {
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      await access(indexPath);
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      createReadStream(indexPath).pipe(response);
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    try {
      const notFound = await readFile(path.join(root, "404.html"), "utf8");
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(notFound);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
