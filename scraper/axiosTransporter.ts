import axios from "axios";
import { AxiosScraperGetRequest, AxiosScraperPostRequest } from "~/types/Axios";

const serverSideScraperTransporter = axios.create({
  baseURL: "http://scraper:8081/",
  headers: {
    sessionid: process.env.INTERSERVER_TOKEN || "",
  },
});

/**
 * Axios Post Request builder used to comunicate to the Scraper
 *
 * This should only be used server side !
 */
export const makeServersidePostScraper: AxiosScraperPostRequest =
  serverSideScraperTransporter.post;

/**
 * Axios Get Request builder used to comunicate to the Scraper
 *
 * This should only be used server side !
 */
// @ts-expect-error
export const makeServersideGetScraper: AxiosScraperGetRequest =
  serverSideScraperTransporter.get;
