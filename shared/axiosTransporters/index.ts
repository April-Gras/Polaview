import axios from "axios";
import { AxiosTvDbApiGetRequest, AxiosTvDbApiPostRequest } from "~/types/Axios";

/**
 * Base axios transporter to reach the main server service
 */
export const serverApiTransporter = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

/**
 * Base axios transporter to reach the imdb scraper service
 */
export const scraperTransporter = axios.create({
  baseURL: "/scraper",
  withCredentials: true,
});

export const tvDbTransporter = axios.create({
  baseURL: "https://api4.thetvdb.com/v4/",
  transformRequest(data, headers) {
    if (headers)
      headers["authorization"] = `Bearer ${process.env.TVDB_API_KEY}`;
    return JSON.stringify(data);
  },
});
