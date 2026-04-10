export const DEFAULT_SERVICE_START_HOUR = 8;
export const DEFAULT_SERVICE_END_HOUR = 18;

export function canUseServiceNow(
  now = new Date(),
  startHour = DEFAULT_SERVICE_START_HOUR,
  endHour = DEFAULT_SERVICE_END_HOUR,
) {
  const hour = now.getHours();
  const minutes = now.getMinutes();

  if (hour < startHour) return false;
  if (hour > endHour) return false;
  if (hour === endHour && minutes > 0) return false;

  return true;
}

export function isAfterServiceHours(
  now = new Date(),
  endHour = DEFAULT_SERVICE_END_HOUR,
) {
  const hour = now.getHours();
  const minutes = now.getMinutes();

  return hour > endHour || (hour === endHour && minutes > 0);
}
