import getServerInfo from "./utils/getServerInfo.js";
export const availableMethods = ["GET"];
const availableRoutes = {
    GET: {
        "/": async () => {
            return "Hello from app1";
        },
        "/info": async () => {
            console.log("Calling info");
            return JSON.stringify(getServerInfo());
        },
    },
};
export const resolveRoute = async (options) => {
    const method = options.method.toUpperCase();
    const path = !options.path ? "/" : options.path;
    if (!availableMethods.find((m) => m === method)) {
        throw new Error(`Method not available ${method}`);
    }
    if (!Object.hasOwn(availableRoutes, method)) {
        throw new Error(`No routes for method: ${method}`);
    }
    const handler = availableRoutes[method][path];
    if (!handler) {
        throw new Error(`No handler found for method: ${method} and path: ${path}`);
    }
    return await handler();
};
//# sourceMappingURL=router.js.map