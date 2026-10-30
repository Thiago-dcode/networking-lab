import http from "node:http";
import { randomUUID } from "node:crypto";
import { callService } from "./utils/services.js";
import { log } from "./utils/logger.js";

const PORT = Number(process.env.APP1_PORT ?? 3000);
const HOST = "0.0.0.0";

type RequestContext = {
  requestId: string;
  started: number;
};

const send = (
  res: http.ServerResponse,
  ctx: RequestContext,
  status: number,
  body: string,
) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain");
  res.end(body);
  log(
    status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    ctx.requestId,
    `responded ${status} in ${Date.now() - ctx.started}ms`,
  );
};

const server = http.createServer(async (req, res) => {
  const ctx: RequestContext = { requestId: randomUUID().slice(0, 8), started: Date.now() };
  const method = req.method ?? "GET";
  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );
  log("info", ctx.requestId, `${method} ${url.pathname} from ${req.socket.remoteAddress}`);

  // Route format: /<serviceNumber>/<path>, e.g. GET /1 or GET /2/some/path
  const [serviceSegment, ...rest] = url.pathname.split("/").filter(Boolean);
  const serviceNumber = Number(serviceSegment);
  if (!Number.isInteger(serviceNumber)) {
    return send(res, ctx, 404, "Missing or invalid service number\n");
  }
  const path = "/" + rest.join("/");

  try {
    const result = await callService({
      method,
      appNum: serviceNumber,
      path,
      requestId: ctx.requestId,
    });
    if (result.error) {
      return send(res, ctx, 502, `${result.error}\n`);
    }
    return send(res, ctx, result.status ?? 200, result.data ?? "");
  } catch (err) {
    // Thrown by callService when the service number is out of range
    const message = err instanceof Error ? err.message : "Unknown error";
    log("warn", ctx.requestId, message);
    // Full stack trace goes to stderr so the file and line of the error are visible in `docker compose logs`
    console.error(`[${ctx.requestId}] stack:`, err instanceof Error ? err.stack : err);
    return send(res, ctx, 404, `${message}\n`);
  }
});

server.listen(PORT, HOST, () => {
  log("info", "startup", `proxy listening on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
