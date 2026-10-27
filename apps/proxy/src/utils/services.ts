
const SERVICES_AMOUNT = 3;

const resolverServiceUrl = (serviceNum: number) => {
  if (serviceNum > SERVICES_AMOUNT || serviceNum < 0) {
    throw new Error(
      `ServiceNum out of range: ${serviceNum}, max services:${SERVICES_AMOUNT}`,
    );
  }
  return `http://${process.env[`APP${serviceNum}_HOST`]}:${process.env[`APP${serviceNum}_PORT`]}`;
};
const getIndexFromApp = async (appNum: number) => {
  try {
    const result = await fetch(resolverServiceUrl(appNum));
    return {
      data: await result.text(),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : `Something went wrong calling app${appNum}:getIndex`,
    };
  }
};

type Method = "GET";
export const serviceController = async (
  method: Method,
  serviceNumber: number,
  path: string = "/",
) => {
  const paths: Record<
    Method,
    Record<number, Record<string, () => Promise<any>>>
  > = {
    GET: {
      1: {
        "/": async () => getIndexFromApp(1),
      },
      2: {
        "/": async () => getIndexFromApp(2),
      },
      3: {
      "/": async () => getIndexFromApp(3),
      },
    },
  };

  if (!Object.hasOwn(paths, method)) {
    throw new Error("Method not found: " + serviceNumber);
  }
  if (!Object.hasOwn(paths[method], serviceNumber)) {
    throw new Error("Service not found: " + serviceNumber);
  }
  const resolver = paths[method]?.[serviceNumber]?.[path];

  if (!resolver) {
    throw new Error("Method not found: " + serviceNumber + ` path: ${path}`);
  }

  return await resolver();
};
