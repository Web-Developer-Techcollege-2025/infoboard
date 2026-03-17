import { fetchMenu } from "../data/KantinemenuAPI.js";

const DAYS = [
  { key: "mandag",  label: "Mandag",  dayCount: 1 },
  { key: "tirsdag", label: "Tirsdag", dayCount: 2 },
  { key: "onsdag",  label: "Onsdag",  dayCount: 3 },
  { key: "torsdag", label: "Torsdag", dayCount: 4 },
  { key: "fredag",  label: "Fredag",  dayCount: 5 },
];

export async function MenuWindow(container) {
  const section = document.createElement("section");
  section.className = "";

  const heading = document.createElement("h2");
  heading.className = "";
  heading.textContent = "Kantinen";
  section.appendChild(heading);

  const dishElement = {};
  DAYS.forEach(({ key, label }) => {
    const card = document.createElement("div");
    card.className = "";
    card.dataset.day = key;

    const title = document.createElement("h3");
    title.className = "";
    title.textContent = label;

    const dish = document.createElement("p");
    dish.className = "";
    dish.textContent = "–";

    dishElement[key] = dish;
    card.appendChild(title);
    card.appendChild(dish);
    section.appendChild(card);
  });

  container.appendChild(section);

  function highlightToday() {
    const todayKey = DAYS.find((d) => d.dayCount === new Date().getDay())?.key;
    DAYS.forEach(({ key }) => {
      const card = section.querySelector(`[data-day="${key}"]`);
      card.classList.toggle("menu-day-card--today", key === todayKey);
    });
  }

  async function updateMenu() {
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return;

    try {
      const data = await fetchMenu();
      heading.textContent = `Kantinen – Uge ${data.Week}`;
      data.Days.forEach(({ DayName, Dish }) => {
        if (dishElement[DayName] && dishElement[DayName].textContent !== Dish) {
          dishElement[DayName].textContent = Dish;
        }
      });
      highlightToday();
    } catch (err) {
      console.error("Failed to fetch canteen menu:", err);
    }
  }

  await updateMenu();

  setInterval(updateMenu, 10 * 60 * 60 * 1000);
}
