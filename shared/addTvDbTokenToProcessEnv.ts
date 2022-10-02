import axios from "axios";

export async function addTvDbTokenToProcessEnv() {
  if (!process.env.TVDB_TOKEN) throw new Error("Missing TVDB_TOKEN in .env");
  if (!process.env.TVDB_PIN) throw new Error("Missing TVDB_PIN in .env");
  const {
    data: {
      data: { token },
    },
  } = await axios.post("https://api4.thetvdb.com/v4/login", {
    apikey: process.env.TVDB_TOKEN,
    pin: process.env.TVDB_PIN,
  });

  process.env.TVDB_API_KEY = token;
}
