import type { QueueOptions, WorkerOptions } from "bullmq";

export const redisConfig: QueueOptions | WorkerOptions = {
  connection: {
    port: 6380,
  },
};
