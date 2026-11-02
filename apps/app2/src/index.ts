import http from "node:http";
import { resolveRoute } from "@netlab/core/router";
import { Response, requestInfo } from "@netlab/core/utils/http";
import { log } from "@netlab/core/utils/log";

const PORT = Number(process.env.APP2_PORT ?? 3000);
const HOST = "0.0.0.0";

const server = http.createServer(async (req, res) => {
	const { method, path, requestId, started } = requestInfo(req);

	log(requestId, `${method} ${path} from ${req.socket.remoteAddress}`);
	try {
		Response.text(res, await resolveRoute({ method, path })).send();

		log(requestId, `responded 200 in ${Date.now() - started}ms`);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Not found";
		Response.text(res, message).status(404).send();
		log(requestId, `responded 404 in ${Date.now() - started}ms: ${message}`);
		// Full stack trace goes to stderr so the file and line of the error are visible in `docker compose logs`
		console.error(
			`[${requestId}] stack:`,
			err instanceof Error ? err.stack : err,
		);
	}
});

server.listen(PORT, HOST, () => {
	log("startup", `app2 listening on http://${HOST}:${PORT}`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
