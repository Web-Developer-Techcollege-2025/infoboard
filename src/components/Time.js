import { create } from "../utils/create";
import { set } from "../utils/set";

export function time(date = new Date()) {
  const currentTime = date.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeEl = create(
    "p",
    "time text-6xl font-extrabold text-shadow-accent-yellow",
  );
  timeEl.textContent = currentTime;

  return timeEl;
}
