import os from "os";

const BYTES_PER_MB = 1024 * 1024;

const toMB = (bytes: number) => Math.round((bytes / BYTES_PER_MB) * 10) / 10;

// "2d 3h 5m 9s" style, skipping leading zero units
const formatUptime = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const parts = [
    days && `${days}d`,
    hours && `${hours}h`,
    minutes && `${minutes}m`,
    `${seconds}s`,
  ];
  return parts.filter(Boolean).join(" ");
};

// A function, so memory and uptime are read on every call instead of once at startup
export default () => ({
  totalMemoryMB: toMB(os.totalmem()),
  freeMemoryMB: toMB(os.freemem()),
  cores: os.cpus().length,
  hostName: os.hostname(),
  uptime: formatUptime(os.uptime()),
});
