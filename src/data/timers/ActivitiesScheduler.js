import { fetchActivities } from "../ActivitiesAPI.js";
import { getISOWeekKey, isFreshTimestamp } from "../../utils/cache.js";

const CACHE_TTL_MS = 15 * 60 * 1000;

let cachedActivities = null;
let cacheTimestamp = 0;
let cacheWeekKey = null;

function hasValidCache(now = new Date()) {
  if (!cachedActivities) return false;

  const isSameWeek = cacheWeekKey === getISOWeekKey(now);
  const isFresh = isFreshTimestamp(cacheTimestamp, CACHE_TTL_MS, now.getTime());

  return isSameWeek && isFresh;
}

export async function getCachedActivities(durationMinutes = 60) {
  const now = new Date();

  if (hasValidCache(now)) {
    return cachedActivities;
  }

  const activities = await fetchActivities(durationMinutes);
  cachedActivities = activities;
  cacheTimestamp = now.getTime();
  cacheWeekKey = getISOWeekKey(now);

  return activities;
}
