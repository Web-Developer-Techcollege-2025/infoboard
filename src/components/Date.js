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
    "day-date-container flex w-full flex-col items-center justify-center gap-[0.2rem] py-1",
  );

  const weekdayEl = create(
    "span",
    "date-weekday text-3xl font-bold tracking-wide text-accent-yellow uppercase",
  );
  weekdayEl.textContent = weekday + " ";

  const restEl = create(
    "span",
    "date-rest text-left text-lg font-normal tracking-wide text-accent-yellow uppercase",
  );
  restEl.textContent = "" + rest;
  set([weekdayEl, restEl], dateContainer);

  setTimeout(dateClock, 1000);
  return dateContainer;
}
