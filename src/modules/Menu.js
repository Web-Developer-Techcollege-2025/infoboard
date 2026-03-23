import { fetchMenu } from "../data/MenuAPI.js";

const DAYS = [
  { key: "mandag", label: "MANDAG", dayCount: 1 },
  { key: "tirsdag", label: "TIRSDAG", dayCount: 2 },
  { key: "onsdag", label: "ONSDAG", dayCount: 3 },
  { key: "torsdag", label: "TORSDAG", dayCount: 4 },
  { key: "fredag", label: "FREDAG", dayCount: 5 },
];

export async function MenuModule() {
  const section = document.createElement("section");
  section.className = "menu-module module bg-secondary-white/50";

  const heading = document.createElement("h2");
  heading.textContent = "UGENS MENU";
  section.appendChild(heading);

  const dishElement = {};
  const priceElement = {};
  DAYS.forEach(({ key, label }) => {
    const card = document.createElement("div");
    card.className = "p-5 w-full";
    card.dataset.day = key;

    const title = document.createElement("h3");
    title.className = "text-primary-red text-xl tracking-widest";
    title.textContent = label;

    const row = document.createElement("div");
    row.className = "flex justify-between w-full gap-2";

    const dish = document.createElement("p");
    dish.className = "text-primary-red text-xl flex-1 font-bold";
    dish.textContent = "–";

    const price = document.createElement("p");
    price.className = "text-xl shrink-0 text-primary-red font-bold";

    dishElement[key] = dish;
    priceElement[key] = price;
    row.appendChild(dish);
    row.appendChild(price);
    card.appendChild(title);
    card.appendChild(row);
    section.appendChild(card);
  });

  function highlightToday() {
    const today = new Date().getDay();
    const todayKey = DAYS.find((d) => d.dayCount === today)?.key;
    DAYS.forEach(({ key, dayCount }) => {
      const card = section.querySelector(`[data-day="${key}"]`);
      const isPast = dayCount < today;
      const isToday = key === todayKey;
      card.classList.toggle("opacity-40", isPast);
      card.classList.toggle("bg-accent-yellow/65", isToday);
      card.classList.toggle("scale-105", isToday);
      card.classList.toggle("rounded-[30px]", isToday);
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
