import { create } from "../utils/create";
import { set } from "../utils/set";

export function time(date = new Date()) {
  const currentTime = date.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeEl = create('p', 'time text-secondary-white text-[170px] font-extrabold px-16 py-1.5');
  timeEl.textContent = currentTime;

  return timeEl;
}