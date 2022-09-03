import axios from "axios";

export const getImdbPageFromUrlAxiosTransporter = axios.create({
  headers: {
    Cookie: "lc-main=en_US",
    "Accept-Language": "en-US,en;q=0.5",
  },
});
