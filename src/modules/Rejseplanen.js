import { fetchRejseplanen } from "../data/RejseplanenAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

// ---------- CONFIG ----------

// Key used to store data in localStorage
const CACHE_KEY = "rejseplanen";

// Key used to remember the last fetch slot
const LAST_FETCH_SLOT_KEY = "rejseplanen-last-fetch-slot";

// Cache duration (30 minutes)
const CACHE_TIME = 30 * 60 * 1000;

// ---------- MAIN MODULE (creates UI) ----------
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

  const leftList = create("ul", "leftList flex flex-col gap-6");
  const rightList = create(
    "ul",
    "rightList flex flex-col gap-6 border-l-2 border-primary-red pl-4",
  );

  set([leftList, rightList], listContainer);
  set([busTitle, listContainer], rejseplanenContainer);

  const data = await getRejseplanenData();
  startBusRendering(data, leftList, rightList, listContainer);

  return rejseplanenContainer;
}

// ---------- FETCH FROM API AND SAVE TO CACHE ----------
async function fetchRejseplanenAPI() {
  const data = await fetchRejseplanen();

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );

  // Save current half-hour slot
  localStorage.setItem(LAST_FETCH_SLOT_KEY, getCurrentHalfHourSlot());

  return data;
}

// ---------- GET DATA (CACHE FIRST, THEN API) ----------
async function getRejseplanenData() {
  const cached = localStorage.getItem(CACHE_KEY);
  const lastFetchSlot = localStorage.getItem(LAST_FETCH_SLOT_KEY);
  const currentSlot = getCurrentHalfHourSlot();

  if (cached) {
    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TIME;

    // If cache is still valid → use it
    if (!isExpired) {
      return parsed.data;
    }

    // If cache expired, only fetch if we are allowed in this time window
    if (canFetchNow() && lastFetchSlot !== currentSlot) {
      try {
        return await fetchRejseplanenAPI();
      } catch (error) {
        console.warn("Using old cache because API failed", error);
        return parsed.data;
      }
    }

    // Outside allowed time or already fetched in this slot → keep old cache
    return parsed.data;
  }

  // If no cache exists, only fetch during allowed hours
  if (canFetchNow()) {
    try {
      return await fetchRejseplanenAPI();
    } catch (error) {
      console.warn("No cache available and API fetch failed", error);
      return null;
    }
  }

  // No cache + outside allowed fetch hours
  return null;
}

// ---------- TIME RULES ----------
function canFetchNow() {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Allowed from 08:00 to 17:00
  // This allows slots:
  // 08:00, 08:30, 09:00 ... 16:30, 17:00
  if (hour < 8) return false;
  if (hour > 17) return false;
  if (hour === 17 && minutes > 0) return false;

  return true;
}

function getCurrentHalfHourSlot() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const half = now.getMinutes() < 30 ? "00" : "30";

  return `${year}-${month}-${day}-${hour}:${half}`;
}

// ---------- START RENDER LOOP ----------
function startBusRendering(data, leftList, rightList, listContainer) {
  if (!data) {
    renderNoBusesMessage(leftList, rightList, listContainer);
    return;
  }

  let departures =
    data.DepartureBoard?.Departure ||
    data.Departure ||
    data.departures ||
    [];

  if (!Array.isArray(departures)) {
    departures = [departures];
  }

  function render() {
    renderBusTimes(departures, leftList, rightList, listContainer);
  }

  render();
  setInterval(render, 1000);
}

// ---------- MAIN RENDER FUNCTION ----------
function renderBusTimes(departures, leftList, rightList, listContainer) {
  leftList.innerHTML = "";
  rightList.innerHTML = "";

  rightList.classList.remove("hidden");
  rightList.classList.add("border-l-2", "border-primary-red");

  listContainer.classList.remove("grid-cols-1");
  listContainer.classList.add("grid-cols-[1fr_auto]");

  const visibleDepartures = departures
    .filter((dep) => !isDepartureExpired(dep))
    .slice(0, 7);

  if (!visibleDepartures.length) {
    renderNoBusesMessage(leftList, rightList, listContainer);
    return;
  }

  const busColors = {
    17: ["bg-light-blue", "bg-dark-blue"],
    18: ["bg-yellow", "bg-dark-yellow"],
    19: ["bg-orange", "bg-primary-red"],
    6: ["bg-light-green", "bg-dark-green"],
  };

  visibleDepartures.forEach((dep) => {
    const name = dep.name || "Bus";
    const direction = dep.direction || "No direction";
    const time = (dep.rtTime || dep.time || "00:00").slice(0, 5);

    const busNumberValue = name.split(" ")[1] || name;

    const [bgMain, bgCircle] = busColors[busNumberValue] || [
      "bg-gray-400",
      "bg-gray-600",
    ];

    // ---------- LEFT COLUMN ----------
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

    // ---------- RIGHT COLUMN ----------
    const rightItem = create(
      "li",
      `rightItem flex min-h-[3.8rem] min-w-[7.5rem] items-center justify-center rounded-full ${bgCircle} text-lg font-extrabold text-accent-yellow shadow-sm`,
    );

    rightItem.textContent = getRemainingTimeLabel(dep);

    set(rightItem, rightList);
  });
}

// ---------- EMPTY STATE ----------
function renderNoBusesMessage(leftList, rightList, listContainer) {
  leftList.innerHTML = "";
  rightList.innerHTML = "";

  rightList.classList.add("hidden");
  rightList.classList.remove("border-l-2", "border-primary-red");

  listContainer.classList.remove("grid-cols-[1fr_auto]");
  listContainer.classList.add("grid-cols-1");

  const messageItem = create(
    "li",
    "rounded-full bg-secondary-white/40 px-6 py-4 text-center text-lg font-bold text-primary-red",
  );

  messageItem.textContent =
    "Busplanen er ikke klar lige nu - tjek igen senere";

  set(messageItem, leftList);
}

// ---------- CHECK IF BUS IS EXPIRED ----------
function isDepartureExpired(dep) {
  const departureTime = getDepartureDate(dep);
  if (!departureTime) return true;

  return departureTime <= new Date();
}

// ---------- COUNTDOWN DISPLAY ----------
function getRemainingTimeLabel(dep) {
  const departureTime = getDepartureDate(dep);
  if (!departureTime) return "--:--";

  const now = new Date();
  const diff = departureTime - now;

  if (diff <= 0) {
    return dep.rtTime || dep.time || "--:--";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const mins = Math.floor(totalSeconds / 60);

  if (mins >= 20) return "20min+";
  if (mins >= 10) return "10min+";

  const secs = totalSeconds % 60;

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

// ---------- HELPER: BUILD DATE ----------
function getDepartureDate(dep) {
  const dateString = dep.date;
  const timeString = (dep.rtTime || dep.time || "").slice(0, 5);

  if (!dateString || !timeString) return null;

  const departureTime = new Date(dateString);
  const [hours, minutes] = timeString.split(":").map(Number);

  departureTime.setHours(hours, minutes, 0, 0);

  return departureTime;
}