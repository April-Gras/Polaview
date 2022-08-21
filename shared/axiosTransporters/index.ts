import {
  AxiosScrapperGetRequest,
  AxiosScrapperPostRequest,
} from "~/types/Axios";
import axios from "axios";

/**
 * Base axios transporter to reach the main server service
 */
export const serverApiTransporter = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

/**
 * Base axios transporter to reach the imdb scrapper service
 */
export const scrapIdmdbTransporter = axios.create({
  baseURL: "/scrapimdb",
  withCredentials: true,
});

const scrapImdbTransporter = axios.create({
  baseURL: "http://scrapimdb:8081/",
});

/**
 * Axios Post Request builder used to comunicate to the Scrapper
 *
 * This should only be used server side !
 */
export const makeServersidePostScrapImdb: AxiosScrapperPostRequest =
  scrapImdbTransporter.post;

/**
 * Axios Get Request builder used to comunicate to the Scrapper
 *
 * This should only be used server side !
 */
// @ts-expect-error
export const makeServersideGetcrapImdb: AxiosScrapperGetRequest =
  scrapImdbTransporter.get;
