// Schedules fetching of DR News data, with caching in localStorage for 24 hours to reduce API calls
import { fetchDRNews } from "../DRNewsAPI.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

// Keys for storing the cached items and timestamp in localStorage
const STORAGE_KEY_ITEMS = "drNewsItems";
const STORAGE_KEY_TIMESTAMP = "drNewsFetched";

export async function getCachedDRNews() {
  const lastFetch = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
  const cachedItems = localStorage.getItem(STORAGE_KEY_ITEMS);

  const cacheIsValid =
    lastFetch && cachedItems && Date.now() - Number(lastFetch) < ONE_DAY;

  // Return cached items if cache is still valid
  if (cacheIsValid) {
    return JSON.parse(cachedItems);
  }

  // Cache expired or missing — fetch fresh data and update localStorage
  const data = await fetchDRNews();
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(data.items));
  localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());

  return data.items;
}
