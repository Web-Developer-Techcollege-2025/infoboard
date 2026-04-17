import { create } from "../utils/create";

export function time() {
  const timeEl = create(
    "p",
    "time text-6xl font-extrabold text-shadow-accent-yellow",
  );
  let intervalId = null;
  let timeoutId = null;

  function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  updateTime();

  // Calculate time until next minute boundary to sync with clock
  const now = new Date();
  const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  timeoutId = setTimeout(() => {
    updateTime();
    intervalId = setInterval(updateTime, 60000);
  }, delay);

  timeEl.destroyModule = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return timeEl;
}
