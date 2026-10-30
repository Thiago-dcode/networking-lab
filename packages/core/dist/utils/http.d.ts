import type { IncomingMessage, ServerResponse } from "node:http";
export declare const requestInfo: (req: IncomingMessage) => {
    requestId: string;
    started: number;
    method: string;
    path: string;
};
export declare class Response {
    protected res: ServerResponse<IncomingMessage>;
    private body;
    constructor(res: ServerResponse<IncomingMessage>, body: any);
    static text(res: ServerResponse<IncomingMessage>, body: string): Response;
    status(status: number): this;
    send(): void;
}
//# sourceMappingURL=http.d.ts.map