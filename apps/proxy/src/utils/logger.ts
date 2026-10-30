type Level = "info" | "warn" | "error";

export const log = (level: Level, requestId: string, message: string) => {
  const line = `${new Date().toISOString()} [${level.toUpperCase()}] [${requestId}] ${message}`;
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
};
