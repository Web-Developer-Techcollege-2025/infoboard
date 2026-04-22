import { fetchWeather } from "../WeatherAPI.js";
import {
  isFreshTimestamp,
  readStorageJSON,
  writeStorageJSON,
} from "../../utils/cache.js";

const STORAGE_KEY = "weatherCache";
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function getCachedWeather() {
  const nowMs = Date.now();
  const parsedCache = readStorageJSON(STORAGE_KEY, (error) => {
    console.warn("Invalid weather cache. Clearing cache.", error);
    localStorage.removeItem(STORAGE_KEY);
  });

  if (
    parsedCache?.data &&
    isFreshTimestamp(parsedCache.timestamp, CACHE_TTL_MS, nowMs)
  ) {
    return parsedCache.data;
  }

  const data = await fetchWeather();
  writeStorageJSON(STORAGE_KEY, {
    data,
    timestamp: nowMs,
  });

  return data;
}
