import { fetchRejseplanen } from "../data/RejseplanenAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

// ---------- CONFIG ----------

// Key used to store data in localStorage
const CACHE_KEY = "rejseplanen";

// Cache duration (60 minutes)
const CACHE_TIME = 60 * 60 * 1000;

// ---------- MAIN MODULE (creates UI) ----------
export async function RejseplanenModule() {

  // Main container for the module
  const rejseplanenContainer = create(
    "section",
    "rejseplanenContainer module bg-secondary-white/50",
  );

  // Title
  const busTitle = create("h2");
  busTitle.textContent = "BUSTIDER";

  // Grid container (left = buses, right = countdown)
  const listContainer = create(
    "div",
    "listContainer grid grid-cols-[1fr_auto] gap-4",
  );

  // Left column (bus info)
  const leftList = create("ul", "leftList flex flex-col gap-4");

  // Right column (countdown timers)
  const rightList = create(
    "ul",
    "rightList flex flex-col gap-4 border-l-2 border-primary-red pl-4",
  );

  // Build DOM structure
  set([leftList, rightList], listContainer);
  set([busTitle, listContainer], rejseplanenContainer);

  // Get data (from cache or API)
  const data = await getRejseplanenData();

  // Start rendering loop
  startBusRendering(data, leftList, rightList, listContainer);

  return rejseplanenContainer;
}

// ---------- FETCH FROM API AND SAVE TO CACHE ----------
async function fetchRejseplanenAPI() {
  const data = await fetchRejseplanen();

  // Save API response + timestamp to localStorage
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );

  return data;
}

// ---------- GET DATA (CACHE FIRST, THEN API) ----------
async function getRejseplanenData() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);

    // Check if cache is expired
    const isExpired = Date.now() - parsed.timestamp > CACHE_TIME;

    // If cache is still valid → use it
    if (!isExpired) {
      return parsed.data;
    }

    // If expired → try fetching new data
    try {
      return await fetchRejseplanenAPI();
    } catch (error) {
      // If API fails → fallback to old cache
      console.warn("Using old cache because API failed", error);
      return parsed.data;
    }
  }

  // If no cache → fetch from API
  return await fetchRejseplanenAPI();
}

// ---------- START RENDER LOOP ----------
function startBusRendering(data, leftList, rightList, listContainer) {

  // If no data at all → show message
  if (!data) {
    renderNoBusesMessage(leftList, rightList, listContainer);
    return;
  }

  // Extract departures (API structure can vary)
  let departures =
    data.DepartureBoard?.Departure ||
    data.Departure ||
    data.departures ||
    [];

  // Ensure it's always an array
  if (!Array.isArray(departures)) {
    departures = [departures];
  }

  // Function that updates UI every second
  function render() {
    renderBusTimes(departures, leftList, rightList, listContainer);
  }

  render(); // initial render
  setInterval(render, 1000); // update every second (no API calls)
}

// ---------- MAIN RENDER FUNCTION ----------
function renderBusTimes(departures, leftList, rightList, listContainer) {

  // Clear previous UI
  leftList.innerHTML = "";
  rightList.innerHTML = "";

  // Restore normal layout (2 columns + divider line)
  rightList.classList.remove("hidden");
  rightList.classList.add("border-l-2", "border-primary-red");

  listContainer.classList.remove("grid-cols-1");
  listContainer.classList.add("grid-cols-[1fr_auto]");

  // Filter out buses that already left
  const visibleDepartures = departures
    .filter((dep) => !isDepartureExpired(dep))
    .slice(0, 7); // show max 7

  // If no valid buses → show empty state
  if (!visibleDepartures.length) {
    renderNoBusesMessage(leftList, rightList, listContainer);
    return;
  }

  // Color mapping based on bus number
  const busColors = {
    17: ["bg-light-blue", "bg-dark-blue"],
    18: ["bg-yellow", "bg-dark-yellow"],
    19: ["bg-orange", "bg-primary-red"],
    6: ["bg-light-green", "bg-dark-green"],
  };

  // Create UI for each bus
  visibleDepartures.forEach((dep) => {

    const name = dep.name || "Bus";
    const direction = dep.direction || "No direction";
    const time = (dep.rtTime || dep.time || "00:00").slice(0, 5);

    // Extract bus number from name
    const busNumberValue = name.split(" ")[1] || name;

    // Get colors (fallback to gray if unknown)
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

    // Set countdown label
    rightItem.textContent = getRemainingTimeLabel(dep);

    set(rightItem, rightList);
  });
}

// ---------- EMPTY STATE ----------
function renderNoBusesMessage(leftList, rightList, listContainer) {

  leftList.innerHTML = "";
  rightList.innerHTML = "";

  // Hide right column + remove divider
  rightList.classList.add("hidden");
  rightList.classList.remove("border-l-2", "border-primary-red");

  // Switch to single column layout
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

  // If already departed → show original time
  if (diff <= 0) {
    return dep.rtTime || dep.time || "--:--";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const mins = Math.floor(totalSeconds / 60);

  // Simplified labels for longer waits
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