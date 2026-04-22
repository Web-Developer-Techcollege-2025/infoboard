import { getFriendlySubject, validEducations } from "./subjectMap.js";
const API_URL = "https://iws.itcn.dk/techcollege/schedules?departmentcode=smed";

function isValidDate(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeScheduleItem(item) {
  if (!item || typeof item !== "object") return null;
  if (!validEducations.includes(item.Education)) return null;
  if (!isValidDate(item.StartDate)) return null;

  return {
    team: item.Team || "-",
    startDate: item.StartDate,
    subject: getFriendlySubject(item.Subject) || "-",
    education: item.Education,
    room: item.Room || "-",
  };
}

export async function fetchActivitiesRaw() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch schedules");

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("API did not return JSON");
    }

    const data = await res.json();
    const items = Array.isArray(data?.value) ? data.value : [];

    return items.map(normalizeScheduleItem).filter(Boolean);
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}

function isCurrentActivity(item, durationMinutes = 60) {
  const now = new Date();
  const start = new Date(item.startDate);
  if (Number.isNaN(start.getTime())) return false;
  const end = new Date(start.getTime() + durationMinutes * 60000);

  return now >= start && now <= end;
}

export async function fetchActivities(durationMinutes = 60) {
  const schedules = await fetchActivitiesRaw();
  const now = new Date();

  const current = [];
  const upcoming = [];

  schedules.forEach((item) => {
    const startDate = new Date(item.startDate);
    if (Number.isNaN(startDate.getTime())) return;

    if (isCurrentActivity(item, durationMinutes)) {
      current.push({ ...item, status: "current" });
    } else if (startDate > now) {
      upcoming.push({ ...item, status: "upcoming" });
    }
  });

  upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return [...current, ...upcoming];
}
