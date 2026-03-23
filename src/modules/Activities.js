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
<<<<<<< HEAD
      `
      module activities-module
      w-full max-w-[2600px] mx-auto
      bg-secondary-white/50 text-white
      flex flex-col justify-start
      `
=======
      "module activities-module bg-secondary-white/50"
>>>>>>> b50e28187bba7bcd282acb7310d3e714c4faa328
    );

    const heading = create("h2");
    heading.textContent = "SKEMA";
    set(heading, container);

<<<<<<< HEAD
    const now = new Date();

    const Activities = activities.filter(
      (a) => new Date(a.startDate) > now
    );

  // fredag

    const today = now.getDay(); 
    let showWeekendMessage = false;

    if (upcomingActivities.length === 0) {
      if (today === 6 || today === 0) {
        
        showWeekendMessage = true;
      } else if (today === 5) {
      
        const fridayActivities = activities
          .filter((a) => new Date(a.startDate).getDay() === 5)
          .map((a) => new Date(a.startDate).getTime() + 60 * 60000); // 60 min default duration

        const lastLectureEnd = fridayActivities.length
          ? Math.max(...fridayActivities)
          : 0;

        if (now.getTime() >= lastLectureEnd) showWeekendMessage = true;
      }
    }

    if (showWeekendMessage) {
      const weekendDiv = create(
        "div",
        `
        text-center text-6xl font-bold
        text-primary-red py-20
        `
      );
      weekendDiv.textContent = "God weekend!";
      set(weekendDiv, container);
      return container;
    }

   //fredag ende

    activities.slice(0, 10).forEach((activity, index) => {
=======
    activities.slice(0, 6).forEach((activity, index) => {
>>>>>>> b50e28187bba7bcd282acb7310d3e714c4faa328
      const variant = colorVariants[index % colorVariants.length];

      const item = create(
        "div",
        `
        mb-5 flex min-h-[3.8rem] items-center rounded-full
        ${variant.bg}
        text-accent-yellow shadow-sm
        `
      );


      const room = create(
        "div",
        `flex min-h-[3.8rem] min-w-[5.2rem] items-center justify-center
        rounded-full px-3
        ${variant.pill}
        text-xl font-extrabold
        `
      );
      room.textContent = activity.room || "-";

      const middle = create(
        "div",
        "ml-4 mr-auto flex items-center gap-5"
      );

      const team = create(
        "div",
        "text-xl font-bold"
      );
      team.textContent = activity.team;

      const subject = create(
        "div",
        "max-w-[170px] text-xl opacity-90"
      );
      subject.textContent = activity.subject;

      set([team, subject], middle);

      const time = create(
        "div",
        "mr-4 text-xl font-bold shrink-0"
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
      "rounded-3xl bg-primary-red p-10 text-center text-xl text-white"
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