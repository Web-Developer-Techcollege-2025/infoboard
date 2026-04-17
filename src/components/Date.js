import { create } from "../utils/create";
import { set } from "../utils/set";

export function dateClock() {
  const dateContainer = create(
    "div",
    "day-date-container flex w-full flex-col items-center justify-center gap-[0.2rem] py-1",
  );
  const weekdayEl = create(
    "span",
    "date-weekday text-3xl font-bold tracking-wider text-accent-yellow uppercase",
  );
  const restEl = create(
    "span",
    "date-rest text-left text-lg font-normal tracking-wider text-accent-yellow uppercase",
  );

  let intervalId = null;
  let timeoutId = null;

  function updateDateDisplay() {
    const date = new Date();
    const weekday = date.toLocaleDateString("da-DK", {
      weekday: "long",
    });
    const rest = date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    weekdayEl.textContent = `${weekday} `;
    restEl.textContent = rest;
  }

  set([weekdayEl, restEl], dateContainer);
  updateDateDisplay();

  // Calculate time until next minute boundary to sync updates.
  const now = new Date();
  const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  timeoutId = setTimeout(() => {
    updateDateDisplay();
    intervalId = setInterval(updateDateDisplay, 60000);
  }, delay);

  dateContainer.destroyModule = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return dateContainer;
}
