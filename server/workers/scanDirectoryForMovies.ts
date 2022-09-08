import path from "node:path";
import { readdirSync, lstatSync } from "node:fs";

import { expose, Worker, spawn } from "threads";

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

    const processFileWorker: ProcessSingleFileThreadWorker = await spawn(
      new Worker("./processSingleFile.ts")
    );
    const wellFormatedFiles = await handleFilesFormat(toProcessFiles);

    for (const filePath of wellFormatedFiles)
      await processFileWorker(
        source,
        filePath,
        path.resolve(directory, filePath)
      );

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

expose(scanDirectoryForMovies);
