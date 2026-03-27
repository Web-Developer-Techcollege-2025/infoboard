import { create } from "../utils/create.js";
import { fetchMenu } from "../data/MenuAPI.js";

const DAYS = [
  { key: "mandag", label: "MANDAG", dayCount: 1 },
  { key: "tirsdag", label: "TIRSDAG", dayCount: 2 },
  { key: "onsdag", label: "ONSDAG", dayCount: 3 },
  { key: "torsdag", label: "TORSDAG", dayCount: 4 },
  { key: "fredag", label: "FREDAG", dayCount: 5 },
];

export async function MenuModule() {
  const section = create("section", "menu-module module bg-secondary-white/50");

  const menuShow = create("div", "flex flex-col gap-6");

  const heading = create("h2");
  heading.textContent = "UGENS MENU";
  section.appendChild(heading);

  const dishElement = {};
  const priceElement = {};
  DAYS.forEach(({ key, label }) => {
    const card = create("div", "w-full px-5");
    card.dataset.day = key;

    const title = create("h3", "text-3xl tracking-widest text-primary-red");
    title.textContent = label;

    const row = create("div", "flex w-full justify-between gap-2");

    const dish = create("p", "flex-1 text-2xl font-bold text-primary-red");
    dish.textContent = "–";

    const price = create("p", "shrink-0 text-xl font-bold text-primary-red");

    dishElement[key] = dish;
    priceElement[key] = price;
    row.appendChild(dish);
    row.appendChild(price);
    card.appendChild(title);
    card.appendChild(row);
    menuShow.appendChild(card);
    section.appendChild(menuShow);
  });

  function highlightToday() {
    const today = new Date().getDay();
    const todayKey = DAYS.find((d) => d.dayCount === today)?.key;
    DAYS.forEach(({ key, dayCount }) => {
      const card = section.querySelector(`[data-day="${key}"]`);
      const isPast = dayCount < today;
      const isToday = key === todayKey;
      card.classList.toggle("opacity-40", isPast);
      card.classList.toggle("bg-accent-yellow/75", isToday);
      card.classList.toggle("rounded-xl", isToday);
      card.classList.toggle("p-7", isToday);
    });
  }

  async function updateMenu() {
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return;

    try {
      const data = await fetchMenu();
      heading.textContent = `MENU - UGE ${data.Week}`;
      if (!data.Days || !Array.isArray(data.Days)) return;
      data.Days.forEach(({ DayName, Dish }) => {
        const key = DayName.toLowerCase();
        if (!dishElement[key]) return;
        const priceMatch = Dish.match(/kr\..+$/i);
        const dishName = priceMatch
          ? Dish.slice(0, priceMatch.index).trim()
          : Dish;
        const dishPrice = priceMatch ? priceMatch[0] : "";
        dishElement[key].textContent = dishName;
        priceElement[key].textContent = dishPrice;
      });
      highlightToday();
    } catch (err) {
      console.error("Failed to fetch canteen menu:", err);
    }
  }

  await updateMenu();

  setInterval(updateMenu, 10 * 60 * 60 * 1000);

  return section;
}
