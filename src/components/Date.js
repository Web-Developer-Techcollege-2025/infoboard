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

  const dateContainer = create('div')

  const weekdayEl = create('span', 'date-weekday ')
  weekdayEl.textContent = weekday + ' ';
  

  const restEl = create('span', 'date-rest')
  restEl.textContent = rest;
  set([weekdayEl, restEl], dateContainer);

  return dateContainer;
}
