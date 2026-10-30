export const log = (level, requestId, message) => {
    const line = `${new Date().toISOString()} [${level.toUpperCase()}] [${requestId}] ${message}`;
    if (level === "error") {
        console.error(line);
    }
    else {
        console.log(line);
    }
};
//# sourceMappingURL=logger.js.map