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
export const scrapImdbTransporter = axios.create({
  baseURL: "/scrapimdb",
  withCredentials: true,
});
