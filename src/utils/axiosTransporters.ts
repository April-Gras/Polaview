import axios from "axios";

const open = window.indexedDB.open("polaview", 1);

/**
 * Base axios transporter to reach the main auth-layer service
 */
export const authLayerApiTransporter = axios.create({
  baseURL: "/auth-layer",
  withCredentials: true,
});

/**
 * Base axios transporter to reach the imdb data-layer service
 */
export const dataLayerTransporter = axios.create({
  baseURL: "/data-layer",
  withCredentials: true,
});
