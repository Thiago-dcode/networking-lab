import http from "node:http";
import { serviceController } from "./utils/services.js";

const PORT = Number(process.env.APP1_PORT ?? 3000);
const HOST = "0.0.0.0";

const send = (res: http.ServerResponse, status: number, body: string) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain");
  res.end(body);
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET") {
    return send(res, 405, `Method not allowed: ${req.method}\n`);
  }

  // Route format: /<serviceNumber>/<path>, e.g. GET /1 or GET /2/some/path
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const [serviceSegment, ...rest] = url.pathname.split("/").filter(Boolean);
  const serviceNumber = Number(serviceSegment);
  if (!Number.isInteger(serviceNumber)) {
    return send(res, 404, "Missing or invalid service number\n");
  }
  const path = "/" + rest.join("/");

  try {
    const result = await serviceController("GET", serviceNumber, path);
    if (result.error) {
      return send(res, 502, `${result.error}\n`);
    }
    return send(res, 200, result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return send(res, 404, `${message}\n`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server runninggg on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
