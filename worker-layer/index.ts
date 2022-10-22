import "#/workers/processSources";
import "#/workers/scanDirectoryForEntities";
import { QueueProcessSources } from "./queues/processSources";

const queue = QueueProcessSources();

// Initial job call
queue.add("processSources", undefined, {
  // Repeat scan sources every 24 hours
  repeat: {
    every: 1000 * 60 * 60 * 24,
    limit: 2,
  },
});
