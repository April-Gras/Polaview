import "dotenv/config";
import "#/workers/processSources";
import "#/workers/scanDirectoryForEntities";
import { QueueProcessSources } from "./queues/processSources";

import { addTvDbTokenToProcessEnv } from "~/addTvDbTokenToProcessEnv";

addTvDbTokenToProcessEnv().then(() => {
  const queue = QueueProcessSources();

  console.log("additon shit to q");
  // Initial job calls
  queue.add("processSources", undefined, {
    // Repeat scan sources every 5 hours
    repeat: {
      every: 1000 * 60 * 60 * 5,
      limit: 2,
    },
  });
  // Imediate queue
  queue.add("processSources", undefined);
});
