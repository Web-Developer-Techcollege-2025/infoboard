import { create } from "../utils/create";
import { set } from "../utils/set";

export function time(date = new Date()) {
  const currentTime = date.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  }); 

  const timeEl = create(
    "p",
    "time px-16 py-1 text-[170px] font-extrabold text-secondary-white",
  );
  timeEl.textContent = currentTime;

  return timeEl;
}
