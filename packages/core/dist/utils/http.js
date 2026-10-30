import { randomUUID } from "node:crypto";
export const requestInfo = (req) => {
    return {
        requestId: randomUUID().slice(0, 8),
        started: Date.now(),
        method: req.method ?? "GET",
        path: new URL(req.url ?? "/", "http://localhost").pathname,
    };
};
export class Response {
    res;
    body;
    constructor(res, body) {
        this.res = res;
        this.body = body;
    }
    static text(res, body) {
        const response = new Response(res, body);
        res.setHeader("Content-Type", "text/plain");
        return response;
    }
    status(status) {
        this.res.statusCode = status;
        return this;
    }
    send() {
        this.res.end(this.body);
    }
}
//# sourceMappingURL=http.js.map