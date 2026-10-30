import { log } from "./logger.js";

const SERVICES_AMOUNT = 3;

const resolverServiceUrl = (serviceNum: number) => {
  if (serviceNum > SERVICES_AMOUNT || serviceNum < 1) {
    throw new Error(
      `ServiceNum out of range: ${serviceNum}, max services:${SERVICES_AMOUNT}`,
    );
  }
  return `http://${process.env[`APP${serviceNum}_HOST`]}:${process.env[`APP${serviceNum}_PORT`]}`;
};

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

export const callService = async ({
  appNum,
  method,
  path,
  requestId,
}: CallServiceArgs): Promise<CallServiceResult> => {
  const target = resolverServiceUrl(appNum) + path;
  const started = Date.now();
  log("info", requestId, `calling app${appNum}: ${method} ${target}`);

  try {
    const result = await fetch(target, { method });
    const data = await result.text();
    log(
      result.ok ? "info" : "warn",
      requestId,
      `app${appNum} answered ${result.status} in ${Date.now() - started}ms (${data.length} bytes)`,
    );
    return { status: result.status, data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log(
      "error",
      requestId,
      `app${appNum} unreachable after ${Date.now() - started}ms: ${message}`,
    );
    return { status: null, data: null, error: message };
  }
};
