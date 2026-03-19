import { getFriendlySubject, validEducations } from "./subjectMap.js";
const API_URL = "https://iws.itcn.dk/techcollege/schedules?departmentcode=smed";
let cachedSchedules = null;


export async function fetchActivities() {
  try {
    if (cachedSchedules) return cachedSchedules;

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch schedules");

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("API did not return JSON");
    }

    const data = await res.json();

   cachedSchedules = data.value
  .filter((item) => validEducations.includes(item.Education))

  .map((item) => ({
    team: item.Team,
    startDate: item.StartDate,
    subject: getFriendlySubject(item.Subject),
    education: item.Education,
    room: item.Room,
  }));

    return cachedSchedules;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}


function isCurrentActivity(item, durationMinutes = 60) {
  const now = new Date();
  const start = new Date(item.startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  return now >= start && now <= end;
}


export async function getActivities(durationMinutes = 60) {
  const schedules = await fetchActivities();
  const now = new Date();

  const current = [];
  const upcoming = [];

  schedules.forEach((item) => {
    if (isCurrentActivity(item, durationMinutes)) {
      current.push({ ...item, status: "current" });
    } else if (new Date(item.startDate) > now) {
      upcoming.push({ ...item, status: "upcoming" });
    }
  });


  upcoming.sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  return [...current, ...upcoming];
}