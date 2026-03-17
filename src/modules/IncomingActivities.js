import { getActivities } from "./incomingActivitiesAPI.js";

export async function renderSchedule(container) {
  try {
    const activities = await getActivities();

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = ""; 

    activities.slice(0, 6).forEach(activity => {
      const item = document.createElement("div");
      item.className = ""; 

    
      const roomDiv = document.createElement("div");
      roomDiv.className = ""; 
      roomDiv.textContent = activity.room;

    
      const teamSubjectDiv = document.createElement("div");
      teamSubjectDiv.className = ""; 

      const teamDiv = document.createElement("div");
      teamDiv.className = ""; 
      teamDiv.textContent = activity.team;

      const subjectDiv = document.createElement("div");
      subjectDiv.className = ""; 
      subjectDiv.textContent = activity.subject;

      teamSubjectDiv.appendChild(teamDiv);
      teamSubjectDiv.appendChild(subjectDiv);

    
      const timeDiv = document.createElement("div");
      timeDiv.className = "";  
      timeDiv.textContent = formatTime(activity.startDate);

  
      item.appendChild(roomDiv);
      item.appendChild(teamSubjectDiv);
      item.appendChild(timeDiv);

   
      wrapper.appendChild(item);
    });

    container.appendChild(wrapper);

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Failed to load schedule</p>";
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}