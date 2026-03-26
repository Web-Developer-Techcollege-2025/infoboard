import { getActivities } from "../data/ActivitiesAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

const colorVariants = [
  { bg: "bg-orange", pill: "bg-primary-red" },
  { bg: "bg-light-green", pill: "bg-dark-green" },
  { bg: "bg-yellow", pill: "bg-dark-yellow" },
  { bg: "bg-light-blue", pill: "bg-dark-blue" },
];

export async function ActivitiesModule() {
  try {
    const activities = await getActivities();

    const container = create(
      "section",
      "module activities-module bg-secondary-white/50",
    );

    const heading = create("h2");
    heading.textContent = "SKEMA";
    set(heading, container);

    activities.slice(0, 7).forEach((activity, index) => {
      const variant = colorVariants[index % colorVariants.length];

      const scheduleShow = create("div", "flex flex-col gap-6");

      const item = create(
        "div",
        `mb-6 flex min-h-[3.8rem] items-center rounded-full ${variant.bg} text-accent-yellow shadow-sm`,
      );

      const room = create(
        "div",
        `flex min-h-[3.8rem] min-w-[7.5rem] items-center justify-center rounded-full px-3 ${variant.pill} text-xl font-extrabold`,
      );
      room.textContent = activity.room || "-";

      const middle = create("div", "mr-auto ml-4 flex items-center gap-5");

      const team = create("div", "text-xl font-bold");
      team.textContent = activity.team;

      const subject = create(
        "div",
        "max-w-42 text-xl opacity-90 first-letter:uppercase",
      );
      subject.textContent = activity.subject;

      set([team, subject], middle);

      const time = create("div", "mr-4 shrink-0 text-xl font-bold");
      time.textContent = formatTime(activity.startDate);

      set([room, middle, time], item);
      set(item, scheduleShow);
      set(scheduleShow, container);
    });

    return container;
  } catch (error) {
    console.error(error);

    const errorDiv = create(
      "div",
      "rounded-3xl bg-primary-red p-10 text-center text-xl text-white",
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
  });
}
