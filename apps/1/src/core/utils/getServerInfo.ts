import os from "os";

export default {
  totalMemory: os.totalmem(),
  freemem: os.freemem(),
  cores: os.cpus().length,
  hostName: os.hostname(),
  upTime: os.uptime(),
};
