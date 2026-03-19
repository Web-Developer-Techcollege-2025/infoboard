import { fetchWeather } from "../data/WeatherAPI";

import { time } from "../components/Time";
import { date } from "../components/Date"
import { weatherIcon } from "../components/WeatherIcons";

import { create } from "../utils/create";
import { set } from "../utils/set";

export function WeatherClockModule() {
  const weatherAndClockContainer = create("section", "module weather-clock-module flex flex-row bg-secondary-white gap-12 rounded-xl");

  const clockContainer = create("div", "clock-container bg-purple m-12 rounded-xl text-center content-start");
  set(time(), clockContainer);

  const dateContainer = create("div", "date-container bg-purple rounded-xl w-full p-6");
  set(date(), dateContainer);

  const clockAndDateContainer = create("div", "clock-date-container mb-12 ");
  set([clockContainer, dateContainer], clockAndDateContainer);

  const weatherContainer = create("div", "weather-container bg-purple px-7 py-3 rounded-xl");

  async function updateWeather() {
    weatherContainer.innerHTML = "";

    fetchWeather()
      .then((data) => {
        const temp = create("p", "weather-temp text-h1 text-secondary-white font-medium");
        const icon = weatherIcon(data.weather[0].description);
        temp.textContent = `${Math.round(data.main.temp)}°C`;

        set([icon, temp], weatherContainer);
      })
      .catch((err) => {
        const error = create("p", "weather-error");
        error.textContent = "Vejrudsigten ikke tilgængeligt";
        set(error, weatherContainer);
        console.error(err);
      });
  }

  updateWeather();
  setInterval(updateWeather, 10 * 60 * 1000);

  set([clockAndDateContainer, weatherContainer], weatherAndClockContainer);
  return weatherAndClockContainer;
}
