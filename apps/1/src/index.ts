import http from "node:http";
import { randomUUID } from "node:crypto";
import { resolveRoute } from "./core/router.js";

const PORT = Number(process.env.APP1_PORT ?? 3000);
const HOST = "0.0.0.0";

const log = (requestId: string, message: string) => {
  console.log(`${new Date().toISOString()} [INFO] [${requestId}] ${message}`);
};

const server = http.createServer(async (req, res) => {
  const requestId = randomUUID().slice(0, 8);
  const started = Date.now();
  const method = req.method ?? "GET";
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  log(requestId, `${method} ${path} from ${req.socket.remoteAddress}`);

  try {
    const body = await resolveRoute({ method, path });
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(`${body}\n`);
    log(requestId, `responded 200 in ${Date.now() - started}ms`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Not found";
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end(`${message}\n`);
    log(requestId, `responded 404 in ${Date.now() - started}ms: ${message}`);
    // Full stack trace goes to stderr so the file and line of the error are visible in `docker compose logs`
    console.error(`[${requestId}] stack:`, err instanceof Error ? err.stack : err);
  }
});

server.listen(PORT, HOST, () => {
  log("startup", `app1 listening on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
