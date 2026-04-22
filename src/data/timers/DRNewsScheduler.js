// Schedules fetching of DR News data, with caching in localStorage for 1 hour
import { fetchDRNews } from "../DRNewsAPI.js";
import {
  isFreshTimestamp,
  readStorageJSON,
  writeStorageJSON,
} from "../../utils/cache.js";

const CACHE_TTL_MS = 60 * 60 * 1000;

const STORAGE_KEY = "drNewsCache";

export async function getCachedDRNews() {
  const cached = readStorageJSON(STORAGE_KEY, (error) => {
    console.warn("Invalid DR news cache. Refreshing cache.", error);
    localStorage.removeItem(STORAGE_KEY);
  });

  const cachedItems = Array.isArray(cached?.items) ? cached.items : null;
  const cacheIsValid =
    cachedItems && isFreshTimestamp(cached?.timestamp, CACHE_TTL_MS);

  // Return cached items if cache is still valid
  if (cacheIsValid) {
    return cachedItems;
  }

  // Cache expired or missing — fetch fresh data and update localStorage
  const data = await fetchDRNews();
  const items = Array.isArray(data?.items) ? data.items : [];

  writeStorageJSON(STORAGE_KEY, {
    items,
    timestamp: Date.now(),
  });

  return items;
}
