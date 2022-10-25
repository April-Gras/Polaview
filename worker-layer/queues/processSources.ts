import { Queue } from "bullmq";
import { redisConfig } from "#/redisConfig";

export function QueueProcessSources() {
  return new Queue<void, void, "processSources">("processSources", redisConfig);
}
