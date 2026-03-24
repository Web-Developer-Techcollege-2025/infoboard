import { fetchRejseplanen } from "../data/RejseplanenAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

const CACHE_KEY = "rejseplanen";
const CACHE_TIME = 30 * 60 * 1000; // 30 min

export async function RejseplanenModule() {
  const rejseplanenContainer = create(
    "section",
    "rejseplanenContainer module bg-secondary-white/50",
  );

  const busTitle = create("h2");
  busTitle.textContent = "BUSTIDER";

  const listContainer = create(
    "div",
    "listContainer grid grid-cols-[1fr_auto] gap-4",
  );

  const leftList = create("ul", "leftList flex flex-col gap-4");
  const rightList = create(
    "ul",
    "rightList flex flex-col gap-4 border-l-2 border-primary-red pl-4",
  );

  set([leftList, rightList], listContainer);
  set([busTitle, listContainer], rejseplanenContainer);

  async function refresh() {
    leftList.innerHTML = "";
    rightList.innerHTML = "";
    const data = await getRejseplanenData();
    loadBusTimes(data, leftList, rightList, refresh);
  }

  await refresh();
  setInterval(refresh, CACHE_TIME);

  return rejseplanenContainer;
}

async function fetchRejseplanenAPI() {
  const data = await fetchRejseplanen();

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );

  return data;
}

// ---------- Fetch + cache ----------
async function getRejseplanenData() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TIME;

    if (!isExpired) {
      return parsed.data;
    } else {
      return await fetchRejseplanenAPI();
    }
  } else {
    return await fetchRejseplanenAPI();
  }
}

// ---------- Main render ----------
function loadBusTimes(data, leftList, rightList, onExpired) {
  if (!data) {
    const errorItem = create("li", "text-xl text-red-500");
    errorItem.textContent = "Could not load bus times";
    set(errorItem, leftList);
    return;
  }

  let departures =
    data.DepartureBoard?.Departure || data.Departure || data.departures || [];

  if (!Array.isArray(departures)) {
    departures = [departures];
  }

  const now = new Date();
  const futureDepartures = departures.filter((dep) => {
    const date = dep.date;
    const time = (dep.rtTime || dep.time || "00:00").slice(0, 5);
    const dt = new Date(date);
    const [h, m] = time.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    return dt > now;
  });

  const firstSix = futureDepartures.slice(0, 7);

  // Цвета по номеру автобуса
  const busColors = {
    17: ["bg-light-blue", "bg-dark-blue"],
    18: ["bg-yellow", "bg-dark-yellow"],
    19: ["bg-orange", "bg-primary-red"],
    6: ["bg-light-green", "bg-dark-green"],
  };

  firstSix.forEach((dep) => {
    const name = dep.name || "Bus";
    const direction = dep.direction || "No direction";
    const time = (dep.rtTime || dep.time || "00:00").slice(0, 5);
    const date = dep.date;

    const busNumberValue = name.split(" ")[1] || name;

    const [bgMain, bgCircle] = busColors[busNumberValue] || [
      "bg-gray-400",
      "bg-gray-600",
    ];

    // ---------- Левая колонка ----------
    const leftItem = create(
      "li",
      `leftItem flex min-h-[3.8rem] min-w-[6rem] items-center rounded-full ${bgMain} text-accent-yellow shadow-sm`,
    );

    const busNumber = create(
      "div",
      `busNumber flex min-h-[3.8rem] min-w-[4rem] items-center justify-center rounded-full px-3 ${bgCircle} text-lg font-extrabold`,
    );
    busNumber.textContent = busNumberValue;

    const busDirection = create(
      "div",
      "busDirection mr-auto ml-4 text-xl font-bold uppercase",
    );
    busDirection.textContent = direction;

    const busTime = create("div", "busTime mr-4 text-xl font-bold");
    busTime.textContent = time;

    set([busNumber, busDirection, busTime], leftItem);
    set(leftItem, leftList);

    // ---------- Правая колонка ----------
    const rightItem = create(
      "li",
      `rightItem flex min-h-[3.8rem] min-w-[7.5rem] items-center justify-center rounded-full ${bgCircle} text-lg font-extrabold text-accent-yellow shadow-sm`,
    );

    rightItem.textContent = getRemainingTimeLabel(date, time);
    set(rightItem, rightList);

    if (date && time) {
      startCountdown(date, time, rightItem, leftItem, onExpired);
    }
  });
}

// ---------- Countdown logic ----------
function getRemainingTimeLabel(dateString, timeString) {
  const now = new Date();

  const departureTime = new Date(dateString);
  const [hours, minutes] = timeString.split(":").map(Number);

  departureTime.setHours(hours, minutes, 0, 0);

  const diff = departureTime - now;

  const totalSeconds = Math.floor(diff / 1000);
  const mins = Math.floor(totalSeconds / 60);

  if (diff <= -2 * 60 * 1000) return null;
  if (diff <= 0) return "Too late ☹";
  if (mins >= 20) return "20min+";
  if (mins >= 10) return "10min+";

  const secs = totalSeconds % 60;

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

// ---------- Live update ----------
function startCountdown(dateString, timeString, element, leftElement, onExpired) {
  let interval;

  function updateCountdown() {
    const label = getRemainingTimeLabel(dateString, timeString);
    if (label === null) {
      clearInterval(interval);
      element.remove();
      leftElement?.remove();
      onExpired?.();
      return;
    }
    element.textContent = label;
  }

  updateCountdown();
  interval = setInterval(updateCountdown, 1000);
}