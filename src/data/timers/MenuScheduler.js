import { fetchMenu } from "../MenuAPI.js";
import {
  getISOWeekKey,
  isFreshTimestamp,
  readStorageJSON,
  writeStorageJSON,
} from "../../utils/cache.js";

const STORAGE_KEY = "menuCache";
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function getCachedMenu() {
  const now = new Date();
  const parsedCache = readStorageJSON(STORAGE_KEY, (error) => {
    console.warn("Invalid menu cache. Clearing cache.", error);
    localStorage.removeItem(STORAGE_KEY);
  });

  if (parsedCache?.data) {
    const sameWeek = parsedCache.weekKey === getISOWeekKey(now);
    const fresh = isFreshTimestamp(
      parsedCache.timestamp,
      CACHE_TTL_MS,
      now.getTime(),
    );

    if (sameWeek && fresh) {
      return parsedCache.data;
    }
  }

  const data = await fetchMenu();
  writeStorageJSON(STORAGE_KEY, {
    data,
    timestamp: now.getTime(),
    weekKey: getISOWeekKey(now),
  });

  return data;
}
