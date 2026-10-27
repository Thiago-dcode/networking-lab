// method -> service numbers reachable through the proxy with that method
const services = new Map<string, readonly number[]>([["GET", [1, 2, 3]]]);

export const buildProxyUrl = (
  method: string,
  serviceNumber: number,
  path: string = "/",
): string | undefined => {
  if (!services.get(method)?.includes(serviceNumber)) {
    return undefined;
  }
  if (!path.startsWith("/")) {
    return undefined;
  }
  return `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}/${serviceNumber}${path}`;
};
