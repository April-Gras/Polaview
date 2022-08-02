import path from "node:path";
import { readdirSync, lstatSync } from "node:fs";

import { expose, Pool, Worker, spawn } from "threads";

import { ProcessSingleFileThreadWorker } from "#/workers/processSingleFile";

type ScanDirectoryForMoviesThreadWorkerReturn = void;
export type ScanDirectoryForMoviesThreadWorker = (
  source: string,
  directory?: string
) => Promise<ScanDirectoryForMoviesThreadWorkerReturn>;

const SUPPORTED_MEDIA_EXTENTIONS = [".mkv", ".mp4", ".avi"];

const scanDirectoryForMovies: ScanDirectoryForMoviesThreadWorker =
  async function scanDirectoryForMovies(source: string, directory = source) {
    const filePaths = readdirSync(directory, {
      encoding: "utf-8",
    });

    const { toProcessDirectories, toProcessFiles } = filePaths.reduce(
      (accumulator, filePath) => {
        if (filePath.startsWith(".") || filePath.includes("sample"))
          return accumulator;
        const targetPath = path.resolve(directory, filePath);

        const lstat = lstatSync(targetPath);

        if (
          lstat.isFile() &&
          SUPPORTED_MEDIA_EXTENTIONS.includes(path.extname(targetPath))
        )
          accumulator.toProcessFiles.push(targetPath);
        if (lstat.isDirectory())
          accumulator.toProcessDirectories.push(targetPath);
        return accumulator;
      },
      { toProcessFiles: [], toProcessDirectories: [] } as {
        toProcessFiles: string[];
        toProcessDirectories: string[];
      }
    );

    // TODO open up thread Q for files
    const threadPool = Pool(
      () => {
        return spawn<ProcessSingleFileThreadWorker>(
          new Worker("./processSingleFile.ts")
        );
      },
      {
        maxQueuedJobs: toProcessFiles.length,
      }
    );

    const tasks = toProcessFiles.map((filePath) => {
      threadPool.queue((task) => task(source, filePath));
    });

    await Promise.all(tasks);
    await threadPool.terminate();

    for (directory of toProcessDirectories) {
      await scanDirectoryForMovies(source, path.resolve(source, directory));
    }
  };

expose(scanDirectoryForMovies);
