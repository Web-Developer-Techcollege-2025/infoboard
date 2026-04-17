import { getActivities } from "../data/ActivitiesAPI.js";
import { create } from "../utils/create.js";
import { createModuleMessageCard } from "../utils/moduleMessageCard.js";
import {
  canUseServiceNow,
  getServiceClosedMessage,
} from "../utils/serviceHours.js";
import { set } from "../utils/set.js";

const colorVariants = [
  { bg: "bg-orange", pill: "bg-dark-orange" },
  { bg: "bg-light-green", pill: "bg-dark-green" },
  { bg: "bg-yellow", pill: "bg-dark-yellow" },
  { bg: "bg-light-blue", pill: "bg-dark-blue" },
];

export async function ActivitiesModule() {
  try {
    const container = create("section", "module activities-module");

    const heading = create("h2");
    heading.textContent = "SKEMA";
    set(heading, container);

    const scheduleShow = create("div", "flex flex-1 flex-col gap-6");
    set(scheduleShow, container);

    async function updateActivities() {
      try {
        const now = new Date();
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

        if (!isWeekday || !canUseServiceNow(now)) {
          renderActivitiesClosedState(scheduleShow);
          return;
        }

        scheduleShow.classList.remove("h-full", "justify-center");
        scheduleShow.classList.add("gap-6");

        const activities = await getActivities();
        scheduleShow.innerHTML = "";

        activities.slice(0, 7).forEach((activity, index) => {
          const variant = colorVariants[index % colorVariants.length];

          const item = create(
            "div",
            `flex min-h-[3.8rem] items-center rounded-full ${variant.bg} text-accent-yellow shadow-sm`,
          );

          const room = create(
            "div",
            `flex min-h-[3.8rem] w-30 shrink-0 items-center justify-center rounded-full px-3 ${variant.pill} text-xl font-extrabold`,
          );
          room.textContent = activity.room || "-";

          const middleLeft = create(
            "div",
            "ml-4 flex w-32 shrink-0 items-center align-middle",
          );

          const middleRight = create(
            "div",
            "flex w-48 shrink-0 items-center overflow-hidden",
          );

          const team = create("div", "text-xl font-bold");
          team.textContent = activity.team;

          const subject = create(
            "div",
            "ml-5 text-xl opacity-90 first-letter:uppercase",
          );
          subject.textContent = activity.subject;

          set(team, middleLeft);
          set(subject, middleRight);

          const time = create(
            "div",
            "mr-4 w-16 shrink-0 text-right text-xl font-bold",
          );
          time.textContent = formatTime(activity.startDate);

          set([room, middleLeft, middleRight, time], item);
          set(item, scheduleShow);
        });
      } catch (error) {
        console.error("Error updating activities:", error);
        renderActivitiesErrorState(scheduleShow);
      }
    }

    await updateActivities();
    const intervalId = setInterval(updateActivities, 60 * 1000); // Check every minute

    container.destroyModule = () => {
      clearInterval(intervalId);
    };

    return container;
  } catch (error) {
    console.error(error);

    const errorDiv = create(
      "div",
      "rounded-3xl bg-primary-blue p-10 text-center text-xl text-white",
    );
    errorDiv.textContent = "AKTIVITETER - utilgængelig";
    return errorDiv;
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function renderActivitiesClosedState(scheduleShow) {
  scheduleShow.innerHTML = "";
  scheduleShow.classList.remove("gap-6");
  scheduleShow.classList.add("h-full", "justify-center");

  const message = createModuleMessageCard(
    getServiceClosedMessage("Aktivitetsskemaet"),
  );
  set(message, scheduleShow);
}

function renderActivitiesErrorState(scheduleShow) {
  scheduleShow.innerHTML = "";
  scheduleShow.classList.remove("gap-6");
  scheduleShow.classList.add("h-full", "justify-center");

  const message = createModuleMessageCard(
    "Aktivitetsskemaet kan ikke tilgås lige nu",
  );
  set(message, scheduleShow);
}
