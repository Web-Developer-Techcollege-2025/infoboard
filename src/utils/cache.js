export function getISOWeekKey(date = new Date()) {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function isFreshTimestamp(timestamp, ttlMs, nowMs = Date.now()) {
  if (!Number.isFinite(timestamp)) return false;
  return nowMs - timestamp < ttlMs;
}

export function readStorageJSON(key, onError) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    if (typeof onError === "function") {
      onError(error);
    }
    return null;
  }
}

export function writeStorageJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
