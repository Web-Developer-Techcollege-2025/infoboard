import { create } from "../utils/create.js";
import { fetchMenu } from "../data/MenuAPI.js";
import { createModuleMessageCard } from "../utils/moduleMessageCard.js";
import { isAfterServiceHours } from "../utils/serviceHours.js";

const DAYS = [
  { key: "mandag", label: "MANDAG", dayCount: 1 },
  { key: "tirsdag", label: "TIRSDAG", dayCount: 2 },
  { key: "onsdag", label: "ONSDAG", dayCount: 3 },
  { key: "torsdag", label: "TORSDAG", dayCount: 4 },
  { key: "fredag", label: "FREDAG", dayCount: 5 },
];

export async function MenuModule() {
  const section = create("section", "menu-module module");
  let isMenuClosed = false;

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
    if (isAfterServiceHours()) {
      if (!isMenuClosed) {
        showMenuClosedState(section);
        isMenuClosed = true;
      }
      return;
    }

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
      if (isMenuClosed) return;
      try {
        await updateMenu();
      } catch (err) {
        console.error("Failed to fetch canteen menu:", err);
        showMenuErrorState(section, err);
      }
    },
    10 * 60 * 60 * 1000,
  );

  // Check cutoff and reopen continuously so the module switches shortly after 18:00 and reopens at 08:00
  setInterval(() => {
    const shouldBeClosed = isAfterServiceHours();

    if (shouldBeClosed && !isMenuClosed) {
      // Transitioning to closed state
      showMenuClosedState(section);
      isMenuClosed = true;
    } else if (!shouldBeClosed && isMenuClosed) {
      // Transitioning back to open state - reset and fetch fresh menu
      isMenuClosed = false;
      updateMenu().catch((err) => {
        console.error("Failed to fetch menu on reopen:", err);
        showMenuErrorState(section, err);
      });
    }
  }, 60 * 1000);

  return section;
}

function showMenuClosedState(section) {
  section.innerHTML = "";

  const heading = create("h2");
  heading.textContent = "UGENS MENU";

  const errorContainer = createModuleMessageCard(
    "Kantinenmenuen vender tilbage igen kl. 8:00 i morgen",
  );
  section.append(heading, errorContainer);
}

function showMenuErrorState(section, error) {
  section.innerHTML = "";

  const heading = create("h2");
  heading.textContent = "UGENS MENU";

  const errorText =
    error?.status === 403
      ? "Kantinens menu kan kun tilgås på Techcollege's netværk"
      : "Kantinens menu kan ikke tilgås lige nu";

  const errorContainer = createModuleMessageCard(errorText);
  section.append(heading, errorContainer);
}
