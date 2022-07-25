import path from "node:path";
import { existsSync, readdirSync, lstatSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

if (!process.env.MEDIA_SOURCES) throw "Please set some MEDIA_SOURCES in .env";
const MEDIA_SOURCES = process.env.MEDIA_SOURCES.split(",");

const SUPPORTED_MEDIA_EXTENTIONS = [".mkv", ".mp4", ".avi"];

export async function startupProcessSources(_: PrismaClient) {
  for (const index in MEDIA_SOURCES) {
    const mediaSource = path.resolve(MEDIA_SOURCES[index]);

    if (!existsSync(mediaSource)) continue;
    scanDirectoryForMovies(mediaSource);
  }
}

function scanDirectoryForMovies(directory: string) {
  const filePaths = readdirSync(directory, {
    encoding: "utf-8",
  });
  const file = [];

  for (const filePath of filePaths) {
    const targetPath = path.resolve(directory, filePath);
    const lstat = lstatSync(targetPath);

    if (filePath.startsWith(".")) continue;
    if (lstat.isFile()) {
      handleSingleFile(targetPath);
    } else if (lstat.isDirectory()) {
      scanDirectoryForMovies(targetPath);
    }
  }
}

function handleSingleFile(filePath: string) {
  const extention = path.extname(filePath);
  const magicRegex =
    /^(.+?)[.( \t]*(?:(?:(19\d{2}|20(?:0\d|1[0-9]))).*|(?:(?=bluray|\d+p|brrip|WEBRip)..*)?[.](mkv|avi|mpe?g|mp4)$)/gim;

  if (!SUPPORTED_MEDIA_EXTENTIONS.includes(extention)) return null;
  const regexReturn = magicRegex.exec(path.basename(filePath));
  if (!regexReturn) return;
  const [, movieTitle, year] = regexReturn;

  console.log({ movieTitle: movieTitle.replace(/\./gi, " "), year });
  // TODO
}
