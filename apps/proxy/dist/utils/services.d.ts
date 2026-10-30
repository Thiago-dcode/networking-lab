type CallServiceArgs = {
    appNum: number;
    method: string;
    path: string;
    requestId: string;
};
export type CallServiceResult = {
    status: number | null;
    data: string | null;
    error: string | null;
};
export declare const callService: ({ appNum, method, path, requestId, }: CallServiceArgs) => Promise<CallServiceResult>;
export {};
//# sourceMappingURL=services.d.ts.map