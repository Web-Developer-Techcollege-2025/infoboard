import { create } from "../utils/create";
import { set } from "../utils/set";

export function date(date = new Date()) {
  const weekday = date.toLocaleDateString("da-DK", {
    weekday: "long",
  });

  const rest = date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const dateContainer = create('div', 'flex flex-col pl-3')

  const weekdayEl = create('span', 'date-weekday text-h1  text-secondary-white font-semibold')
  weekdayEl.textContent = weekday + ' ';



  const restEl = create('span', 'date-rest text-secondary-white font-regular text-large')
  restEl.textContent = rest;
  set([weekdayEl, restEl], dateContainer);

  return dateContainer;
}
