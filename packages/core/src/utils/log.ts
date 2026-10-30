export const log = (requestId: string, message: string) => {
  console.log(`${new Date().toISOString()} [INFO] [${requestId}] ${message}`);
};
