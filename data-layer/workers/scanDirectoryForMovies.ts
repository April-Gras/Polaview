import path from "node:path";
import fs from "node:fs";
import { readdirSync, lstatSync } from "node:fs";

import { expose, Worker, spawn, Pool } from "threads";

import { ProcessSingleFileThreadWorker } from "#/workers/processSingleFile";
import { ConvertFileToMp4ThreadWorker } from "#/workers/convertFileToMp4";

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

    const currentDirectoryFileThreadPool = Pool(
      () =>
        spawn<ProcessSingleFileThreadWorker>(
          new Worker("./processSingleFile.ts")
        ),
      {
        concurrency: 1,
        size: 1,
      }
    );
    const wellFormatedFiles = await handleFilesFormat(toProcessFiles);

    const results = wellFormatedFiles.map((filePath) =>
      currentDirectoryFileThreadPool.queue((task) => {
        const fullPath = path.resolve(directory, filePath);

        return task(
          source,
          filePath,
          fullPath,
          findMatchingSubTracks(fullPath)
        );
      })
    );

    await Promise.allSettled(results);
    await currentDirectoryFileThreadPool.terminate();
    for (const directory of toProcessDirectories) {
      await scanDirectoryForMovies(source, path.resolve(source, directory));
    }
  };

async function handleFilesFormat(files: string[]): Promise<string[]> {
  const notMp4Files = files.filter(
    (pathName) => path.extname(pathName) !== ".mp4"
  );
  const convertToMp4Worker = await spawn<ConvertFileToMp4ThreadWorker>(
    new Worker("./convertFileToMp4")
  );

  for (const filePath of notMp4Files) await convertToMp4Worker(filePath);

  return files
    .map((filePath) => `${path.parse(filePath).name}.mp4`)
    .reduce((accumulator, file) => {
      if (!accumulator.includes(file)) accumulator.push(file);
      return accumulator;
    }, [] as string[]);
}

function findMatchingSubTracks(wellFormatedFilePath: string) {
  const targetExtentions = [".srt"];

  return targetExtentions.reduce((accumulator, targetExtention) => {
    const potencialSubtitleTrack = wellFormatedFilePath.replace(
      /\.mp4/,
      targetExtention
    );

    if (fs.existsSync(potencialSubtitleTrack))
      accumulator.push(potencialSubtitleTrack);
    return accumulator;
  }, [] as string[]);
}

expose(scanDirectoryForMovies);
