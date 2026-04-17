export const DEFAULT_SERVICE_START_HOUR = 8;
export const DEFAULT_SERVICE_END_HOUR = 18;
export const DEFAULT_SERVICE_OPEN_DAYS = [1, 2, 3, 4, 5];

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

export function getNextServiceOpenDate(
  now = new Date(),
  startHour = DEFAULT_SERVICE_START_HOUR,
  openDays = DEFAULT_SERVICE_OPEN_DAYS,
) {
  const nextOpen = new Date(now);
  nextOpen.setHours(startHour, 0, 0, 0);

  if (now < nextOpen && openDays.includes(now.getDay())) {
    return nextOpen;
  }

  do {
    nextOpen.setDate(nextOpen.getDate() + 1);
  } while (!openDays.includes(nextOpen.getDay()));

  return nextOpen;
}

export function getServiceClosedMessage(
  serviceName,
  now = new Date(),
  startHour = DEFAULT_SERVICE_START_HOUR,
  openDays = DEFAULT_SERVICE_OPEN_DAYS,
) {
  const nextOpen = getNextServiceOpenDate(now, startHour, openDays);
  const openTime = `${startHour}:00`;

  if (
    nextOpen.getDate() === now.getDate() &&
    nextOpen.getMonth() === now.getMonth() &&
    nextOpen.getFullYear() === now.getFullYear()
  ) {
    return `${serviceName} åbner igen kl. ${openTime} i dag`;
  }

  if (nextOpen.getDay() === 1) {
    return `${serviceName} vender tilbage igen kl. ${openTime} på mandag`;
  }

  return `${serviceName} vender tilbage igen kl. ${openTime} i morgen`;
}
