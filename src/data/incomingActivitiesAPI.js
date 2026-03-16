const API_URL = "https://iws.itcn.dk/techcollege/schedules?departmentcode=smed";

export async function getSchedules() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }

  const data = await response.json();

  return data.value;
}