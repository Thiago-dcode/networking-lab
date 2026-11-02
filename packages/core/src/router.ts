import type { AvailableRoutes, Method, Route } from "./types.js";
import getServerInfo from "./utils/getServerInfo.js";

const baseRoutes: AvailableRoutes = {
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
export const resolveRoute = async (
  options: Route,
  customRoutes?: AvailableRoutes,
) => {
  const method = options.method.toUpperCase() as Method;
  const path = !options.path ? "/" : options.path;
  // Merge per method. A plain spread would replace the whole GET table, so custom GET routes
  // would hide the base GET routes ("/" and "/info").
  const routes = !customRoutes
    ? baseRoutes
    : (Object.fromEntries(
        Object.entries(baseRoutes).map(([m, table]) => [
          m,
          { ...table, ...customRoutes[m as Method] },
        ]),
      ) as AvailableRoutes);
  if (!Object.hasOwn(routes, method)) {
    throw new Error(`No routes for method: ${method}`);
  }
  const handler = routes[method][path];

  if (!handler) {
    throw new Error(`No handler found for method: ${method} and path: ${path}`);
  }

  return await handler();
};
