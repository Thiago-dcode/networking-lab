import http from "node:http";
import { resolveRoute } from "@netlab/core/router";
import type { AvailableRoutes } from "@netlab/core/types";
import { Response, requestInfo } from "@netlab/core/utils/http";
import { log } from "@netlab/core/utils/log";
import pg from "pg";

const PORT = Number(process.env.APP3_PORT ?? 3000);
const HOST = "0.0.0.0";

// Connection pool to Postgres. Connection details come from .env (DB_* variables).
const pool = new pg.Pool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT ?? 5432),
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

// Routes that only app3 serves. resolveRoute merges them with the shared base routes
// from @netlab/core, so "/" and "/info" still work here.
const customRoutes: AvailableRoutes = {
	GET: {
		"/users": async () => {
			const { rows } = await pool.query(
				"SELECT * FROM network_lab ORDER BY id",
			);
			return `${JSON.stringify(rows, null, 2)}\n`;
		},
	},
};

const server = http.createServer(async (req, res) => {
	const { method, path, requestId, started } = requestInfo(req);

	log(requestId, `${method} ${path} from ${req.socket.remoteAddress}`);
	try {
		// The second argument adds app3's routes on top of the shared ones.
		Response.text(
			res,
			await resolveRoute({ method, path }, customRoutes),
		).send();

		log(requestId, `responded 200 in ${Date.now() - started}ms`);
	} catch (err) {
		// Any error ends up here, including an unknown path, so every failure is reported as 500.
		// (Apps 1 and 2 return 404 for unknown paths; splitting the two cases needs a separate check.)
		// The real error goes to the logs.
		Response.text(res, "Failed to load users\n").status(500).send();
		log(requestId, `responded 500 in ${Date.now() - started}ms`);
		console.error(
			`[${requestId}] stack:`,
			err instanceof Error ? err.stack : err,
		);
	}
});

server.listen(PORT, HOST, () => {
	log("startup", `app3 listening on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () =>
	server.close(() => pool.end().then(() => process.exit(0))),
);
process.on("SIGINT", () =>
	server.close(() => pool.end().then(() => process.exit(0))),
);
