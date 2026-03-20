import { fetchRejseplanen } from "../data/RejseplanenAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

const CACHE_KEY = "rejseplanen";
const CACHE_TIME = 30 * 1000; // 30 min

export async function RejseplanenModule() {
  const rejseplanenContainer = create(
    "section",
    "rejseplanenContainer module bg-secondary-white/50"
  );

  const busTitle = create(
    "h2",
    "busTitle mb-10 text-center text-7xl font-black text-primary-red"
  );
  busTitle.textContent = "BUSTIDER";

  const listContainer = create(
    "div",
    "listContainer grid grid-cols-[1fr_auto] gap-6"
  );

  const leftList = create("ul", "leftList flex flex-col gap-5");
  const rightList = create(
    "ul",
    "rightList flex flex-col gap-5 border-l-2 border-primary-red pl-6"
  );

  set([leftList, rightList], listContainer);
  set([busTitle, listContainer], rejseplanenContainer);

  const data = await getRejseplanenData();
  loadBusTimes(data, leftList, rightList);

  return rejseplanenContainer;
}

  async function fetchRejseplanenAPI() {
    const data = await fetchRejseplanen();

    localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );

  return data;
  }

// ---------- Fetch + cache ----------
async function getRejseplanenData() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TIME;
    console.log(isExpired);
    

    if (!isExpired) {
      return parsed.data;
    } else {
          return await fetchRejseplanenAPI()
    }
  } else {
    return await fetchRejseplanenAPI()
  } 

}

// ---------- Main render ----------
function loadBusTimes(data, leftList, rightList) {
  if (!data) {
    const errorItem = create("li", "text-red-500 text-2xl");
    errorItem.textContent = "Could not load bus times";
    set(errorItem, leftList);
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

  const firstSix = departures.slice(0, 6);

  // 🎯 Цвета по номеру автобуса
  const busColors = {
    "17": ["bg-light-blue", "bg-dark-blue"],
    "18": ["bg-yellow", "bg-dark-yellow"],
    "6": ["bg-light-green", "bg-dark-green"],
  };

  firstSix.forEach((dep) => {
    const name = dep.name || "Bus";
    const direction = dep.direction || "No direction";
    const time = (dep.rtTime || dep.time || "00:00").slice(0, 5);
    const date = dep.date;

    const busNumberValue = name.split(" ")[1] || name;

    const [bgMain, bgCircle] =
      busColors[busNumberValue] || ["bg-gray-400", "bg-gray-600"];

    // ---------- Левая колонка ----------
    const leftItem = create(
      "li",
      `leftItem min-h-[4.5rem] min-w-[7rem] flex items-center rounded-full ${bgMain} text-white shadow-sm`
    );

    const busNumber = create(
      "div",
      `busNumber flex items-center justify-center min-h-[4.4rem] min-w-[7.5rem] px-4 rounded-full ${bgCircle} text-2xl font-extrabold`
    );
    busNumber.textContent = busNumberValue;

    const busDirection = create(
      "div",
      "busDirection ml-4 mr-auto text-3xl font-bold uppercase"
    );
    busDirection.textContent = direction;

    const busTime = create(
      "div",
      "busTime mr-6 text-3xl font-bold"
    );
    busTime.textContent = time;

    set([busNumber, busDirection, busTime], leftItem);
    set(leftItem, leftList);

    // ---------- Правая колонка ----------
    const rightItem = create(
      "li",
      `rightItem flex items-center justify-center min-h-[4.5rem] min-w-[12rem] rounded-full ${bgCircle} text-white text-3xl font-extrabold shadow-sm`
    );

    rightItem.textContent = getRemainingTimeLabel(date, time);
    set(rightItem, rightList);

    if (date && time) {
      startCountdown(date, time, rightItem);
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

  if (diff <= 0) return "Too late ☹";
  if (mins >= 20) return "20min+";
  if (mins >= 10) return "10min+";

  const secs = totalSeconds % 60;

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

// ---------- Live update ----------
function startCountdown(dateString, timeString, element) {
  function updateCountdown() {
    element.textContent = getRemainingTimeLabel(dateString, timeString);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}