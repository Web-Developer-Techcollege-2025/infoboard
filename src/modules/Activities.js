import { getActivities } from "../data/ActivitiesAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

const colorVariants = [
  { bg: "bg-orange", pill: "bg-primary-red" },
  { bg: "bg-light-green", pill: "bg-dark-green" },
  { bg: "bg-yellow", pill: "bg-dark-yellow" },
  { bg: "bg-[#2563eb]/20", pill: "bg-[#2563eb]" },
];

export async function ActivitiesModule() {
  try {
    const activities = await getActivities();

    const container = create("section", `module activities-module`);

    const heading = create("h2");
    heading.textContent = "SKEMA";
    set(heading, container);

    activities.slice(0, 10).forEach((activity, index) => {
      const variant = colorVariants[index % colorVariants.length];

      const item = create(
        "div",
        `flex items-center justify-between ${variant.bg} mb-8 rounded-full px-10 py-8 transition-transform duration-200`,
      );

      const room = create(
        "div",
        ` ${variant.pill} w-[200px] truncate rounded-full px-6 py-4 text-center text-4xl font-semibold text-white`,
      );
      room.textContent = activity.room;

      const middle = create("div", `flex flex-1 items-center gap-10 px-10`);

      const team = create("div", `text-4xl font-semibold tracking-wide`);
      team.textContent = activity.team;

      const subject = create("div", `text-3xl font-light opacity-90`);
      subject.textContent = activity.subject;

      set([team, subject], middle);

      const time = create(
        "div",
        `min-w-[140px] text-right text-3xl font-semibold text-white`,
      );
      time.textContent = formatTime(activity.startDate);

      set([room, middle, time], item);
      set(item, container);
    });

    return container;
  } catch (error) {
    console.error(error);

    const errorDiv = create(
      "div",
      `rounded-3xl bg-primary-red p-10 text-center text-4xl text-white`,
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
