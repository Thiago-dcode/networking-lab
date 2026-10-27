import http from "node:http";
import { viewPathExistOrthrow, VIEWS_PATH } from "./utils/views.js";
import { buildProxyUrl } from "./utils/services.js";
const PORT = Number(process.env.WEB_PORT ?? 3000);
const HOST = process.env.WEB_HOST ?? "0.0.0.0";
const DEFAULT_SERVICE = 1;

// "/2/some/path" -> service 2, path "/some/path"
// "/some/path"   -> service 1 (default), path "/some/path"
const parseRoute = (pathname: string) => {
  const [first, ...rest] = pathname.split("/").filter(Boolean);
  const serviceNumber = Number(first);
  if (first !== undefined && Number.isInteger(serviceNumber)) {
    return { serviceNumber, path: "/" + rest.join("/") };
  }
  return { serviceNumber: DEFAULT_SERVICE, path: pathname };
};

const server = http.createServer(async (req, res) => {
  const method = req.method ?? "";
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const { serviceNumber, path } = parseRoute(pathname);

  const url = buildProxyUrl(method, serviceNumber, path);
  if (!url) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`No ${method} route for service ${serviceNumber} path ${path}`);
    return;
  }

  try {
    const result = await fetch(url);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(await result.text());
  } catch (err) {
    console.error(err);
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Gateway");
  }
});

server.listen(PORT, HOST, async () => {
  if (!(await viewPathExistOrthrow())) {
    throw new Error("Views path does not exist: " + VIEWS_PATH);
  }

  console.log(`Server runninggg on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
