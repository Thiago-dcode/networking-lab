import getServerInfo from "./utils/getServerInfo.js";


type Method = "GET";
const availableMethods: Method[] = ["GET"];
type Route = {
  method: string;
  path: string;
};

const availableRoutes: Record<Method, Record<string, () => Promise<string>>> = {
  GET: {
    "/": async () => {
      return "Hello from app1";
    },
    "/info": async () => {
      console.log("Calling info")
      return JSON.stringify(getServerInfo);
    },
  },
};
export const resolveRoute = async (options: Route) => {
  const method = options.method.toUpperCase() as Method;
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
