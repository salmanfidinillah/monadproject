import { createServer } from "node:http";
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const output = resolve(root, "docs/video/BOM-OPER-Monad-Explainer.webm");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webm": "video/webm",
};

const server = createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/__upload") {
    let size = 0;
    const destination = createWriteStream(output);
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 150_000_000) {
        request.destroy(new Error("Video exceeds the 150 MB local upload limit."));
        destination.destroy();
      }
    });
    request.pipe(destination);
    destination.on("finish", () => {
      response.writeHead(201, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ file: "BOM-OPER-Monad-Explainer.webm", bytes: size }));
    });
    destination.on("error", (error) => {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.message);
    });
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405);
    response.end("Method Not Allowed");
    return;
  }

  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const filePath = resolve(root, `.${requestPath}`);
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(8765, "127.0.0.1", () => console.log("BOM OPER renderer at http://127.0.0.1:8765/docs/video/render.html"));
