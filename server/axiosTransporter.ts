import axios from "axios";
import {
  AxiosScrapperGetRequest,
  AxiosScrapperPostRequest,
} from "~/types/Axios";

const serverSideScrapImdbTransporter = axios.create({
  baseURL: "http://scrapimdb:8081/",
  headers: {
    sessionid: process.env.INTERSERVER_TOKEN || "",
  },
});

/**
 * Axios Post Request builder used to comunicate to the Scrapper
 *
 * This should only be used server side !
 */
export const makeServersidePostScrapImdb: AxiosScrapperPostRequest =
  serverSideScrapImdbTransporter.post;

/**
 * Axios Get Request builder used to comunicate to the Scrapper
 *
 * This should only be used server side !
 */
// @ts-expect-error
export const makeServersideGetScrapImdb: AxiosScrapperGetRequest =
  serverSideScrapImdbTransporter.get;
