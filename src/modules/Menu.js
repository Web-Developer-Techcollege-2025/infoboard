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
  const section = create("section", "menu-module module");

  const menuShow = create(
    "div",
    "menu-container flex h-full flex-col justify-between gap-6",
  );

  const heading = create("h2");
  heading.textContent = "UGENS MENU";
  section.appendChild(heading);

  const dishElement = {};
  const priceElement = {};
  DAYS.forEach(({ key, label }) => {
    const card = create("div", "menu-card w-full px-5");
    card.dataset.day = key;

    const title = create("h3", "text-lg tracking-widest text-primary-blue");
    title.textContent = label;

    const row = create(
      "div",
      "dish-price-container flex w-full justify-between gap-4 text-xl",
    );

    const dish = create(
      "p",
      "dish flex-1 font-bold wrap-break-word hyphens-auto text-primary-blue",
    );
    dish.textContent = "–";

    const price = create("p", "price shrink-0 font-bold text-primary-blue");

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
  }

  try {
    await updateMenu();
  } catch (err) {
    console.error("Failed to fetch canteen menu:", err);
    showMenuErrorState(section, err);
    return section;
  }

  setInterval(
    async () => {
      try {
        await updateMenu();
      } catch (err) {
        console.error("Failed to fetch canteen menu:", err);
        showMenuErrorState(section, err);
      }
    },
    10 * 60 * 60 * 1000,
  );

  return section;
}

function showMenuErrorState(section, error) {
  section.innerHTML = "";

  const heading = create("h2");
  heading.textContent = "UGENS MENU";

  const errorContainer = create(
    "div",
    "flex h-full items-center justify-center rounded-xl bg-secondary-white/40 p-8 text-center",
  );
  const errorText = create(
    "p",
    "max-w-[26ch] text-2xl font-bold tracking-wide text-balance text-primary-blue",
  );
  errorText.textContent =
    error?.status === 403
      ? "Kantinens menu kan kun tilgås på Techcollege's netværk"
      : "Kantinens menu kan ikke tilgås lige nu";

  errorContainer.append(errorText);
  section.append(heading, errorContainer);
}
