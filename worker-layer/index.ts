import "dotenv/config";
import "#/workers/processSources";
import "#/workers/scanDirectoryForEntities";
import "#/workers/convertFileToWebMp4";
import "#/workers/bindFileToDbEntity";
import { QueueProcessSources } from "#/queues/processSources";

import { addTvDbTokenToProcessEnv } from "~/addTvDbTokenToProcessEnv";

addTvDbTokenToProcessEnv().then(() => {
  const queue = QueueProcessSources();

  // Initial job calls
  queue.add("processSources", undefined, {
    // Repeat scan sources every 5 hours
    repeat: {
      every: 1000 * 60 * 60 * 5,
    },
  });
  queue.add("processSources");
});
