import { fetchRejseplanen } from "../data/RejseplanenAPI.js";
import { create } from "../utils/create.js";
import { createModuleMessageCard } from "../utils/moduleMessageCard.js";
import { set } from "../utils/set.js";
import {
  canUseServiceNow,
  getServiceClosedMessage,
} from "../utils/serviceHours.js";

// ---------- CONFIG ----------

// localStorage key where bus data is saved
const CACHE_KEY = "rejseplanen";

// localStorage key where we save the last half-hour slot
// this helps avoid repeated fetches in the same slot
const LAST_FETCH_SLOT_KEY = "rejseplanen-last-fetch-slot";

// how long cache is valid
// 30 min * 60 sec * 1000 ms
const CACHE_TIME = 30 * 60 * 1000;
const MIN_VISIBLE_TIME_MS = 0;
const RED_TIME_MS = 3 * 60 * 1000;
const ORANGE_TIME_MS = 4 * 60 * 1000;
const YELLOW_TIME_MS = 5 * 60 * 1000;
const COUNTDOWN_TEXT_CLASSES = [
  "text-accent-yellow",
  "text-primary-red",
  "text-orange",
  "text-yellow",
];

// how often countdown should visually update
// every 1 second
const RENDER_INTERVAL = 1000;

// how often we should re-check cache / API while page is open
// every 1 minute
const REFRESH_INTERVAL = 60 * 1000;

// ---------- MAIN MODULE ----------

export async function RejseplanenModule() {
  // main section that contains the whole module
  const rejseplanenContainer = create("section", "rejseplanenContainer module");

  // title
  const busTitle = create("h2");
  busTitle.textContent = "BUSTIDER";

  // wrapper for the two columns
  const listContainer = create(
    "div",
    "listContainer grid grid-cols-[1fr_auto] gap-4",
  );

  // left column = bus number, direction, departure time
  const leftList = create("ul", "leftList flex flex-col gap-6");

  // right column = countdown / remaining time
  const rightList = create(
    "ul",
    "rightList flex flex-col gap-6 border-l-2 border-primary-blue pl-4",
  );

  // put lists inside wrapper
  set([leftList, rightList], listContainer);

  // put title + wrapper inside main section
  set([busTitle, listContainer], rejseplanenContainer);

  // get initial data (from cache or API)
  const data = await getRejseplanenData();

  // start rendering and updating
  const destroy = startBusRendering(data, leftList, rightList, listContainer);

  // optional cleanup hook
  // useful only if the module may later be removed from the page
  // for your info-board this is usually not needed, but harmless
  rejseplanenContainer.destroyModule = destroy;

  return rejseplanenContainer;
}

// ---------- FETCH FROM API AND SAVE TO CACHE ----------

async function fetchRejseplanenAPI() {
  // get fresh data from API
  const data = await fetchRejseplanen();

  // save data + current time to cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );

  // save current half-hour slot
  // example: 2026-03-27-08:00 or 2026-03-27-08:30
  localStorage.setItem(LAST_FETCH_SLOT_KEY, getCurrentHalfHourSlot());

  return data;
}

// ---------- GET DATA (CACHE FIRST, THEN API) ----------

async function getRejseplanenData() {
  // try to read saved cache
  const cached = localStorage.getItem(CACHE_KEY);

  // try to read the slot of the last successful fetch
  const lastFetchSlot = localStorage.getItem(LAST_FETCH_SLOT_KEY);

  // calculate the current half-hour slot
  const currentSlot = getCurrentHalfHourSlot();

  // if cache exists, try to use it first
  if (cached) {
    let parsed = null;

    try {
      // convert JSON string from localStorage back into object
      parsed = JSON.parse(cached);
    } catch (error) {
      // if cache is corrupted, clear it
      console.warn("Invalid Rejseplanen cache. Clearing cache.", error);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(LAST_FETCH_SLOT_KEY);
    }

    // only continue if parsed cache looks valid
    if (parsed?.data && parsed?.timestamp) {
      // check if cache is older than allowed cache time
      const isExpired = Date.now() - parsed.timestamp > CACHE_TIME;

      // if cache is still fresh, use it immediately
      if (!isExpired) {
        return parsed.data;
      }

      // if cache expired:
      // fetch fresh data only if
      // 1) current time is allowed
      // 2) we have not already fetched in this slot
      if (canFetchNow() && lastFetchSlot !== currentSlot) {
        try {
          return await fetchRejseplanenAPI();
        } catch (error) {
          // if API fails, keep using old cache
          console.warn("Using old cache because API failed", error);
          return parsed.data;
        }
      }

      // if outside allowed hours
      // or already fetched in this slot
      // keep using old cache
      return parsed.data;
    }
  }

  // if there is no cache at all:
  // only fetch if current time is allowed
  if (canFetchNow()) {
    try {
      return await fetchRejseplanenAPI();
    } catch (error) {
      console.warn("No cache available and API fetch failed", error);
      return null;
    }
  }

  // no cache + fetch not allowed right now
  return null;
}

// ---------- TIME RULES ----------

function canFetchNow() {
  const now = new Date();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  return isWeekday && canUseServiceNow(now);
}

function getCurrentHalfHourSlot() {
  const now = new Date();

  // build date parts
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");

  // if minutes are 0-29 => slot is :00
  // if minutes are 30-59 => slot is :30
  const half = now.getMinutes() < 30 ? "00" : "30";

  return `${year}-${month}-${day}-${hour}:${half}`;
}

// ---------- NORMALIZE DATA ----------

function normalizeDepartures(data) {
  // if data is missing, return empty array
  if (!data) return [];

  // API may return departures in different shapes
  // so we try the known possible paths
  let departures =
    data.DepartureBoard?.Departure || data.Departure || data.departures || [];

  // if API returned a single object instead of array,
  // wrap it into array so later code can always use .filter / .slice / .forEach
  if (!Array.isArray(departures)) {
    departures = [departures];
  }

  return departures;
}

// ---------- START RENDER LOOP ----------

function startBusRendering(data, leftList, rightList, listContainer) {
  // keep current departures in memory
  let departures = normalizeDepartures(data);
  let renderedDepartures = [];
  let countdownRows = [];

  function renderFullBusList() {
    renderedDepartures = departures
      .filter((dep) => !isDepartureExpired(dep))
      .sort((a, b) => getDepartureDate(a) - getDepartureDate(b))
      .slice(0, 7);

    if (!renderedDepartures.length) {
      countdownRows = [];
      renderNoBusesMessage(leftList, rightList, listContainer);
      return;
    }

    countdownRows = renderBusTimes(
      renderedDepartures,
      leftList,
      rightList,
      listContainer,
    );
  }

  function render() {
    if (!countdownRows.length) {
      return;
    }

    let shouldRerender = false;

    countdownRows.forEach(({ dep, element }) => {
      const remainingMs = getRemainingTimeMs(dep);

      if (remainingMs === null || remainingMs <= MIN_VISIBLE_TIME_MS) {
        shouldRerender = true;
        return;
      }

      element.textContent = getRemainingTimeLabel(dep);
      applyCountdownTextClass(element, getCountdownTextClass(remainingMs));
    });

    if (shouldRerender) {
      renderFullBusList();
    }
  }

  async function refreshData() {
    try {
      // get possibly updated data from cache / API
      const freshData = await getRejseplanenData();

      // normalize data shape again
      departures = normalizeDepartures(freshData);

      // re-render immediately after refresh
      renderFullBusList();
    } catch (error) {
      console.warn("Could not refresh bus data", error);
    }
  }

  // first immediate render
  renderFullBusList();

  // update countdown every second
  const renderIntervalId = setInterval(render, RENDER_INTERVAL);

  // check for fresh data every minute
  const refreshIntervalId = setInterval(refreshData, REFRESH_INTERVAL);

  // return cleanup function
  return function destroy() {
    clearInterval(renderIntervalId);
    clearInterval(refreshIntervalId);
  };
}

// ---------- MAIN RENDER FUNCTION ----------

function renderBusTimes(departures, leftList, rightList, listContainer) {
  // clear old content before drawing fresh UI
  leftList.innerHTML = "";
  rightList.innerHTML = "";
  const countdownRows = [];

  // restore normal list sizing/gap when buses are available
  leftList.classList.remove("h-full");
  leftList.classList.add("gap-6");
  listContainer.classList.remove("h-full");

  // make sure right column is visible
  rightList.classList.remove("hidden");
  rightList.classList.add("border-l-2", "border-primary-blue");

  // make sure layout is 2 columns
  listContainer.classList.remove("grid-cols-1");
  listContainer.classList.add("grid-cols-[1fr_auto]");

  // colors for specific known bus lines
  const busColors = {
    17: ["bg-light-blue", "bg-dark-blue"],
    18: ["bg-yellow", "bg-dark-yellow"],
    19: ["bg-orange", "bg-dark-orange"],
    6: ["bg-light-green", "bg-dark-green"],
  };

  departures.forEach((dep) => {
    // safe fallbacks if fields are missing
    const name = dep.name || "Bus";
    const direction = dep.direction || "No direction";
    const time = (dep.rtTime || dep.time || "00:00").slice(0, 5);

    // try to extract line number from bus name
    const busNumberValue = extractBusNumber(name);

    // choose colors for this bus number, or fallback gray colors
    const [bgMain, bgCircle] = busColors[busNumberValue] || [
      "bg-gray-400",
      "bg-gray-600",
    ];

    // ---------- LEFT COLUMN ----------
    // this row shows bus number, direction, departure time

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

    // put all left-side parts into left row
    set([busNumber, busDirection, busTime], leftItem);

    // add left row to left column
    set(leftItem, leftList);

    // ---------- RIGHT COLUMN ----------
    // this row shows countdown / remaining time

    const remainingMs = getRemainingTimeMs(dep);
    const countdownTextClass = getCountdownTextClass(remainingMs);

    const rightItem = create(
      "li",
      `rightItem flex min-h-[3.8rem] min-w-[7.5rem] items-center justify-center rounded-full ${bgCircle} text-lg font-extrabold ${countdownTextClass} shadow-sm`,
    );

    // calculate countdown text
    rightItem.textContent = getRemainingTimeLabel(dep);

    // add right row to right column
    set(rightItem, rightList);
    countdownRows.push({ dep, element: rightItem });
  });

  return countdownRows;
}

// ---------- EMPTY STATE ----------

function renderNoBusesMessage(leftList, rightList, listContainer) {
  // clear both columns
  leftList.innerHTML = "";
  rightList.innerHTML = "";

  // hide right column completely
  rightList.classList.add("hidden");
  rightList.classList.remove("border-l-2", "border-primary-blue");

  // switch layout to single column
  listContainer.classList.remove("grid-cols-[1fr_auto]");
  listContainer.classList.add("grid-cols-1");

  // match menu error card sizing by letting the message fill available module height
  listContainer.classList.add("h-full");
  leftList.classList.remove("gap-6");
  leftList.classList.add("h-full");

  // create message item
  const now = new Date();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const isServiceClosed = !isWeekday || !canUseServiceNow(now);
  const messageText = isServiceClosed
    ? getServiceClosedMessage("Busplanen", now)
    : "Ingen afgange lige nu";
  const messageItem = createModuleMessageCard(messageText, "li");

  // show message in left column
  set(messageItem, leftList);
}

// ---------- CHECK IF BUS IS EXPIRED ----------

function isDepartureExpired(dep) {
  const remainingMs = getRemainingTimeMs(dep);

  // if date cannot be built, treat bus as unusable / expired
  if (remainingMs === null) return true;

  // remove entries once departure time is reached so the next buses can fill in
  return remainingMs <= MIN_VISIBLE_TIME_MS;
}

// ---------- COUNTDOWN DISPLAY ----------

function getRemainingTimeLabel(dep) {
  // build actual departure Date
  const departureTime = getDepartureDate(dep);

  // if date is invalid, show fallback
  if (!departureTime) return "--:--";

  const now = new Date();
  const diff = departureTime - now;

  // if bus is already gone, show planned/real time instead of countdown
  if (diff <= 0) {
    return dep.rtTime || dep.time || "--:--";
  }

  // convert time difference to seconds and minutes
  const totalSeconds = Math.floor(diff / 1000);
  const mins = Math.floor(totalSeconds / 60);

  // for longer waits show simplified labels
  if (mins >= 20) return "+20m";
  if (mins >= 10) return "+10m";

  // for short waits show exact MM:SS countdown
  const secs = totalSeconds % 60;

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

function getRemainingTimeMs(dep) {
  const departureTime = getDepartureDate(dep);
  if (!departureTime) return null;
  return departureTime - new Date();
}

function getCountdownTextClass(remainingMs) {
  if (remainingMs === null) return "text-accent-yellow";
  if (remainingMs > MIN_VISIBLE_TIME_MS && remainingMs < RED_TIME_MS) {
    return "text-primary-red";
  }
  if (remainingMs >= RED_TIME_MS && remainingMs < ORANGE_TIME_MS) {
    return "text-orange";
  }
  if (remainingMs >= ORANGE_TIME_MS && remainingMs < YELLOW_TIME_MS) {
    return "text-yellow";
  }

  return "text-accent-yellow";
}

function applyCountdownTextClass(element, className) {
  element.classList.remove(...COUNTDOWN_TEXT_CLASSES);
  element.classList.add(className);
}

// ---------- HELPER: EXTRACT BUS NUMBER ----------

function extractBusNumber(name) {
  // search for number inside string
  // examples:
  // "Bus 17" -> "17"
  // "17 Aalborg" -> "17"
  const match = String(name).match(/\b\d+\b/);

  return match ? match[0] : name;
}

// ---------- HELPER: BUILD DATE ----------

function getDepartureDate(dep) {
  // get date and time strings from API object
  const dateString = dep.date;
  const timeString = (dep.rtTime || dep.time || "").slice(0, 5);

  // if something is missing, cannot build date
  if (!dateString || !timeString) return null;

  const [hours, minutes] = timeString.split(":").map(Number);

  // if date looks like YYYY-MM-DD, build date manually
  // this is safer than trusting browser parsing
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  // fallback for other date formats
  const departureTime = new Date(dateString);

  // if browser could not parse date, return null
  if (Number.isNaN(departureTime.getTime())) {
    return null;
  }

  // insert hours/minutes into parsed date
  departureTime.setHours(hours, minutes, 0, 0);

  return departureTime;
}
