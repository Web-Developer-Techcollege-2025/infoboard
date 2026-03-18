import { fetchActivities } from "../data/ActivitiesAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

export async function ActivitiesModule() {
  try {
    const activities = await fetchActivities();

    const activitiesContainer = create("section", "activities-module module");
    const heading = create("h2", "activities-heading");
    heading.textContent = "AKTIVITETER";
    set(heading, activitiesContainer);

    activities.slice(0, 6).forEach((activity) => {
      const item = create("div", "activity-item");

      const roomDiv = create("div", "activity-room");
      roomDiv.textContent = activity.room;

      const teamSubjectDiv = create("div", "activity-team-subject");

      const teamDiv = create("div", "activity-team");
      teamDiv.textContent = activity.team;

      const subjectDiv = create("div", "activity-subject");
      subjectDiv.textContent = activity.subject;

      set([teamDiv, subjectDiv], teamSubjectDiv);

      const timeDiv = create("div", "activity-time");
      timeDiv.textContent = formatTime(activity.startDate);

      set([roomDiv, teamSubjectDiv, timeDiv], item);

      set(item, activitiesContainer);
    });

    return activitiesContainer;
  } catch (error) {
    console.error(error);
    const errorDiv = create("div", "activities-error");
    errorDiv.textContent = "AKTIVITETER - utilgængelig";
    return errorDiv;
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
