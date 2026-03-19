import { getDepartures } from "../data/rejseplanenAPI"
import { create } from "../utils/create"
import { set } from "../utils/set"

export function rejseplanenModule() {
  const rejseplanenContainer = create("div", "rejseplanen-container")

  const busTitle = create("h2")
  busTitle.textContent = "BUSTIDER"

  const listContainer = create("div", "list-container")

  const leftList = create("ul", "left-list")
  const rightList = create("ul", "right-list")

  set([leftList, rightList], listContainer)
  set([busTitle, listContainer], rejseplanenContainer)

  loadBusTimes(leftList, rightList)

  return rejseplanenContainer
}

async function loadBusTimes(leftList, rightList) {
  const data = await getDepartures()

  if (!data) {
    const errorItem = create("li")
    errorItem.textContent = "Could not load bus times"
    set(errorItem, leftList)
    return
  }

  let departures =
    data.DepartureBoard?.Departure ||
    data.Departure ||
    data.departures

  if (!departures) {
    const emptyItem = create("li")
    emptyItem.textContent = "No departures found"
    set(emptyItem, leftList)
    return
  }

  if (!Array.isArray(departures)) {
    departures = [departures]
  }

  const firstSix = departures.slice(0, 6)

  firstSix.forEach((dep) => {
    const name = dep.name || "Bus"
    const direction = dep.direction || "No direction"
    const time = (dep.rtTime || dep.time || "00:00").slice(0, 5)
    const date = dep.date

    // ---------- Левая колонка ----------
    const leftItem = create("li", "departure-item")

    const busName = create("div", "bus-name")
    busName.textContent = name

    const busDirection = create("div", "bus-direction")
    busDirection.textContent = direction

    const busTime = create("div", "bus-time")
    busTime.textContent = time

    set([busName, busDirection, busTime], leftItem)
    set(leftItem, leftList)

    // ---------- Правая колонка ----------
    const rightItem = create("li", "countdown-item")
    rightItem.textContent = "--:--"
    set(rightItem, rightList)

    // ---------- Запускаем countdown ----------
    if (date && time) {
      startCountdown(date, time, rightItem)
    }
  })
}

function startCountdown(dateString, timeString, element) {
  function updateCountdown() {
    const now = new Date()

    const departureTime = new Date(dateString)
    const [hours, minutes] = timeString.split(":").map(Number)

    departureTime.setHours(hours, minutes, 0, 0)

    const diff = departureTime - now

    if (diff <= 0) {
      element.textContent = "00:00"
      return
    }

    const totalSeconds = Math.floor(diff / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60

    const formattedMins = String(mins).padStart(2, "0")
    const formattedSecs = String(secs).padStart(2, "0")

    element.textContent = `${formattedMins}:${formattedSecs}`
  }

  updateCountdown()
  setInterval(updateCountdown, 1000)
}