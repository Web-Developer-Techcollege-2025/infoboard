import { create } from "../utils/create";
import { set } from "../utils/set";

export function dateClock(date = new Date()) {
  const weekday = date.toLocaleDateString("da-DK", {
    weekday: "long",
  });

  const rest = date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const dateContainer = create(
    "div",
    "day-date-container flex py-1 w-full flex-col items-center justify-center",
  );

  const weekdayEl = create(
    "span",
    "date-weekday text-3xl font-bold uppercase tracking-wide text-accent-yellow",
  );
  weekdayEl.textContent = weekday + " ";

  const restEl = create(
    "span",
    "date-rest text-lg text-left uppercase tracking-wide text-accent-yellow font-normal",
  );
  restEl.textContent = "" + rest;
  set([weekdayEl, restEl], dateContainer);

  setTimeout(dateClock, 1000)
  return dateContainer;
}