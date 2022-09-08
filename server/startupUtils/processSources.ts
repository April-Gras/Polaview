import path from "node:path";
import { existsSync } from "node:fs";

import { spawn, Pool, Worker } from "threads";

import { ScanDirectoryForMoviesThreadWorker } from "#/workers/scanDirectoryForMovies";
import { applyInfoColor } from "#/utils/log";

if (!process.env.MEDIA_SOURCES) throw "Please set some MEDIA_SOURCES in .env";
const MEDIA_SOURCES = process.env.MEDIA_SOURCES.split(",");

export async function startupProcessSources() {
  const sourcesToCheck = MEDIA_SOURCES.reduce((accumulator, source) => {
    const mediaSource = path.resolve(source);

    if (!existsSync(mediaSource)) return accumulator;
    accumulator.push(mediaSource);
    return accumulator;
  }, [] as string[]);
  const sourceThreadPool = Pool(
    () => {
      return spawn<ScanDirectoryForMoviesThreadWorker>(
        new Worker("../workers/scanDirectoryForMovies.ts")
      );
    },
    {
      maxQueuedJobs: sourcesToCheck.length,
    }
  );

  const tasks = sourcesToCheck.map((source) => {
    return sourceThreadPool.queue((task) => task(source));
  });

  await Promise.all(tasks);
  await sourceThreadPool.terminate(true);

  console.info(applyInfoColor("Done with all the startup processings"));
}
