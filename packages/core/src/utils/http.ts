import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export const requestInfo = (req: IncomingMessage) => {
  return {
    requestId: randomUUID().slice(0, 8),
    started: Date.now(),
    method: req.method ?? "GET",
    path: new URL(req.url ?? "/", "http://localhost").pathname,
  };
};

export class Response {
  constructor(
    protected res: ServerResponse<IncomingMessage>,
    private body: any,
  ) {
    res.statusCode = 200;
  }

  static text(res: ServerResponse<IncomingMessage>, body: string) {
    const response = new Response(res, body);
    res.setHeader("Content-Type", "text/plain");
    return response;
  }

  status(status: number) {
    this.res.statusCode = status;
    return this;
  }

  send() {
    this.res.end(this.body);
  }
}
