import puppeteer from "puppeteer";

type Puppeteer = typeof puppeteer;

export async function getBrowserFromPuppeteer(puppeteer: Puppeteer) {
  return await puppeteer.launch({
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    ],
  });
}
