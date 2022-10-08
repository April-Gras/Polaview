import axios from "axios";

const open = window.indexedDB.open("polaview", 1);

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
