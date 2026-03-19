import { fetchWeather } from "../data/WeatherAPI";
import { time } from "../components/Time";
import { date } from "../components/Date";

import { create } from "../utils/create";
import { set } from "../utils/set";

export function WeatherClockModule() {
  const weatherAndClockContainer = create(
    "section",
    "module, weather-clock-module",
  );

  const clockContainer = create("div", "clock-container");
  set(time(), clockContainer);

  const dateContainer = create("div", "date-container");
  set(date(), dateContainer);

  const clockAndDateContainer = create("div", "clock-date-container");
  set([clockContainer, dateContainer], clockAndDateContainer);

  const weatherContainer = create("div", "weather-container");
  async function updateWeather() {
    weatherContainer.innerHTML = "";
  }
  fetchWeather()
    .then(async (data) => {
      const temp = create("p", "weather-temp");
      /* const icon = await weatherIcon(data.weather[0].description); */
      temp.textContent = `${Math.round(data.main.temp)}°C`;

      set([temp], weatherContainer);
    })
    .catch((err) => {
      const error = create("p", "weather-error");
      error.textContent = "Vejrudsigten ikke tilgængeligt";
      set(error, weatherContainer);
      console.error(err);
    });
  updateWeather();
  setInterval(updateWeather, 10 * 60 * 1000);

  set([clockAndDateContainer, weatherContainer], weatherAndClockContainer);
  return weatherAndClockContainer;
}
