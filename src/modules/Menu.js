import { create } from "../utils/create.js";
import { fetchMenu } from "../data/MenuAPI.js";
import { createModuleMessageCard } from "../utils/moduleMessageCard.js";
import {
  canUseServiceNow,
  getNextServiceOpenDate,
  getServiceClosedMessage,
} from "../utils/serviceHours.js";

const DAYS = [
  { key: "mandag", label: "MANDAG", dayCount: 1 },
  { key: "tirsdag", label: "TIRSDAG", dayCount: 2 },
  { key: "onsdag", label: "ONSDAG", dayCount: 3 },
  { key: "torsdag", label: "TORSDAG", dayCount: 4 },
  { key: "fredag", label: "FREDAG", dayCount: 5 },
];

const OPEN_HOURS_RETRY_MS = 5 * 60 * 1000;

export async function MenuModule() {
  const section = create("section", "menu-module module");
  let isMenuClosed = false;
  let refreshTimeoutId = null;
  let cutoffIntervalId = null;

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

  function showMenuLayout() {
    section.innerHTML = "";
    section.append(heading, menuShow);
  }

  async function updateMenu() {
    const now = new Date();

    if (!isMenuOpenNow(now)) {
      if (!isMenuClosed) {
        showMenuClosedState(section, now);
        isMenuClosed = true;
      }
      return;
    }

    showMenuLayout();

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

  let initialLoadFailed = false;

  try {
    await updateMenu();
  } catch (err) {
    initialLoadFailed = true;
    console.error("Failed to fetch canteen menu:", err);
    showMenuErrorState(section, err);
  }

  scheduleNextMenuRefresh(initialLoadFailed ? OPEN_HOURS_RETRY_MS : undefined);

  // Check cutoff continuously so the module switches after 18:00 and reopens at the next weekday 08:00.
  cutoffIntervalId = setInterval(() => {
    const shouldBeOpen = isMenuOpenNow();

    if (!shouldBeOpen && !isMenuClosed) {
      // Transitioning to closed state
      showMenuClosedState(section);
      isMenuClosed = true;
    } else if (shouldBeOpen && isMenuClosed) {
      // Transitioning back to open state - reset and fetch fresh menu
      isMenuClosed = false;
      updateMenu().catch((err) => {
        console.error("Failed to fetch menu on reopen:", err);
        showMenuErrorState(section, err);
        scheduleNextMenuRefresh(OPEN_HOURS_RETRY_MS);
      });
      scheduleNextMenuRefresh();
    }
  }, 60 * 1000);

  section.destroyModule = () => {
    if (cutoffIntervalId) {
      clearInterval(cutoffIntervalId);
    }
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }
  };

  return section;

  function scheduleNextMenuRefresh(delayMs) {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }

    const now = new Date();
    const nextRefresh = delayMs
      ? new Date(now.getTime() + delayMs)
      : getNextMenuOpenDate(now);

    refreshTimeoutId = setTimeout(async () => {
      let shouldScheduleNextOpenRefresh = true;

      try {
        if (isMenuClosed) {
          isMenuClosed = false;
        }
        await updateMenu();
      } catch (err) {
        console.error("Failed to fetch canteen menu:", err);
        showMenuErrorState(section, err);
        const retryDelay = isMenuOpenNow() ? OPEN_HOURS_RETRY_MS : undefined;
        shouldScheduleNextOpenRefresh = false;
        scheduleNextMenuRefresh(retryDelay);
        return;
      } finally {
        if (shouldScheduleNextOpenRefresh) {
          scheduleNextMenuRefresh();
        }
      }
    }, nextRefresh - now);
  }
}

function getNextMenuOpenDate(now = new Date()) {
  return getNextServiceOpenDate(now);
}

function isMenuOpenNow(now = new Date()) {
  const dayOfWeek = now.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5 && canUseServiceNow(now);
}

function getClosedMenuMessage(now = new Date()) {
  return getServiceClosedMessage("Kantinenmenuen", now);
}

function showMenuClosedState(section, now = new Date()) {
  section.innerHTML = "";

  const heading = create("h2");
  heading.textContent = "UGENS MENU";

  const errorContainer = createModuleMessageCard(getClosedMenuMessage(now));
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
