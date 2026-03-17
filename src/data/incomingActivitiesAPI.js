const API_URL = "https://iws.itcn.dk/techcollege/schedules?departmentcode=smed";

let cachedSchedules = null;


export async function getSchedules() {
  if (cachedSchedules) return cachedSchedules;

  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch schedules");

  const data = await response.json();
  cachedSchedules = data.value.map(item => ({
    team: item.Team,
    startDate: item.StartDate,
    subject: item.Subject,
    education: item.Education,
    room: item.Room
  }));

  return cachedSchedules;
}

function isCurrentActivity(item, durationMinutes = 60) {
  const now = new Date();
  const start = new Date(item.startDate);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return now >= start && now <= end;
}


export async function getActivities(durationMinutes = 60) {
  const schedules = await getSchedules();
  const now = new Date();

  const currentActivities = schedules
    .filter(item => isCurrentActivity(item, durationMinutes))
    .map(item => ({ ...item, status: "current" }));


  const upcomingActivities = schedules
    .filter(item => new Date(item.startDate) > now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .map(item => ({ ...item, status: "upcoming" }));


  return [...currentActivities, ...upcomingActivities];
}


export async function getActivitiesByTeam(team, durationMinutes = 60) {
  const activities = await getActivities(durationMinutes);
  return activities.filter(item => item.team === team);
}


export async function getActivitiesByDate(date, durationMinutes = 60) {
  const activities = await getActivities(durationMinutes);
  return activities.filter(item => item.startDate.startsWith(date));
}