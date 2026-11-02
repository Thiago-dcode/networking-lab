export type Method = "GET";
export type Route = {
  method: string;
  path: string;
};

export type AvailableRoutes = Record<Method, Record<string, () => Promise<string>>>;
