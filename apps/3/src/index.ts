import http from "node:http";
import pg from "pg";
const PORT = Number(process.env.APP3_PORT ?? 3000);
const HOST = "0.0.0.0";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const getUsers = async () => {
  const { rows } = await pool.query("SELECT * FROM network_lab ORDER BY id");
  return rows;
};

const server = http.createServer(async (_, res) => {
  try {
    const users = await getUsers();
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(`${JSON.stringify(users, null, 2)}\n`);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Failed to load users\n");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server runninggg on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () => server.close(() => pool.end().then(() => process.exit(0))));
process.on("SIGINT", () => server.close(() => pool.end().then(() => process.exit(0))));
