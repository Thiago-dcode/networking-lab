import http from "node:http";
const PORT = Number(process.env.APP2_PORT ?? 3000);
const HOST = "0.0.0.0";
const APP = process.env.APP2_HOST;

const server = http.createServer((_, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end(`Hello, world from app: ${APP} !\n`);
});

server.listen(PORT, HOST, () => {
  console.log(`Server runninggg on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
