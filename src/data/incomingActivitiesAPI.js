const API_URL = "http://iws.itcn.dk/techcollege/schedules";

export async function getSchedules() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }

  const data = await response.json();

  return data.value;
}