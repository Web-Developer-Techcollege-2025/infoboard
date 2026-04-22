import { fetchRejseplanen } from "../RejseplanenAPI.js";
import { canUseServiceNow } from "../../utils/serviceHours.js";
import {
  isFreshTimestamp,
  readStorageJSON,
  writeStorageJSON,
} from "../../utils/cache.js";

const CACHE_KEY = "rejseplanen";
const LAST_FETCH_SLOT_KEY = "rejseplanen-last-fetch-slot";
const CACHE_TTL_MS = 30 * 60 * 1000;

function canFetchNow(now = new Date()) {
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  return isWeekday && canUseServiceNow(now);
}

function getCurrentHalfHourSlot(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const half = now.getMinutes() < 30 ? "00" : "30";

  return `${year}-${month}-${day}-${hour}:${half}`;
}

async function fetchAndCacheRejseplanen(now = new Date()) {
  const data = await fetchRejseplanen();

  writeStorageJSON(CACHE_KEY, {
    data,
    timestamp: now.getTime(),
  });
  localStorage.setItem(LAST_FETCH_SLOT_KEY, getCurrentHalfHourSlot(now));

  return data;
}

export async function getCachedRejseplanen() {
  const now = new Date();
  const parsedCache = readStorageJSON(CACHE_KEY, (error) => {
    console.warn("Invalid Rejseplanen cache. Clearing cache.", error);
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(LAST_FETCH_SLOT_KEY);
  });

  if (parsedCache) {
    const hasData = Boolean(parsedCache.data);
    const isFresh = isFreshTimestamp(
      parsedCache.timestamp,
      CACHE_TTL_MS,
      now.getTime(),
    );
    if (hasData && isFresh) {
      return parsedCache.data;
    }

    const lastFetchSlot = localStorage.getItem(LAST_FETCH_SLOT_KEY);
    const currentSlot = getCurrentHalfHourSlot(now);

    if (canFetchNow(now) && lastFetchSlot !== currentSlot) {
      try {
        return await fetchAndCacheRejseplanen(now);
      } catch (error) {
        console.warn("Using old cache because API failed", error);
      }
    }

    return parsedCache.data;
  }

  if (!canFetchNow(now)) {
    return null;
  }

  try {
    return await fetchAndCacheRejseplanen(now);
  } catch (error) {
    console.warn("No cache available and API fetch failed", error);
    return null;
  }
}
