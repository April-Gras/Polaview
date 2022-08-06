import path from "node:path";
import { readdirSync, lstatSync } from "node:fs";

import { expose, Worker, spawn } from "threads";

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

    const processFileWorker: ProcessSingleFileThreadWorker = await spawn(
      new Worker("./processSingleFile.ts")
    );

    for (let filePath of toProcessFiles)
      await processFileWorker(source, filePath);

    for (directory of toProcessDirectories) {
      await scanDirectoryForMovies(source, path.resolve(source, directory));
    }
  };

expose(scanDirectoryForMovies);
