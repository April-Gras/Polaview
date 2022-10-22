import { Worker } from "bullmq";
import path from "node:path";
import { existsSync } from "node:fs";

import { QueueScanDirectoryForEntities } from "#/queues/scanDirectoryForEntities";

new Worker("processSources", async () => {
  if (!process.env.MEDIA_SOURCES) throw "Please set some MEDIA_SOURCES in .env";
  const MEDIA_SOURCES = process.env.MEDIA_SOURCES.split(",");
  const sourcesToCheck = MEDIA_SOURCES.reduce((accumulator, source) => {
    const mediaSource = path.resolve(source);

    if (!existsSync(mediaSource)) return accumulator;
    accumulator.push(mediaSource);
    return accumulator;
  }, [] as string[]);
  const queue = QueueScanDirectoryForEntities();

  sourcesToCheck.forEach((source) => {
    queue.add("scanDirectoryForEntities", { source });
  });
});
