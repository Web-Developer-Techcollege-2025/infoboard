import { create } from "../utils/create";

export function time(date = new Date()) {
  const timeEl = create(
    "p",
    "time text-6xl font-extrabold text-shadow-accent-yellow",
  );

  function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  updateTime(); 
  setInterval(updateTime, 1000); 

  return timeEl;
}