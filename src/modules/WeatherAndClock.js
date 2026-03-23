import { fetchWeather } from "../data/WeatherAPI";

import { time } from "../components/Time";
import { date } from "../components/Date";
import { weatherIcon } from "../components/WeatherIcons";

import { create } from "../utils/create";
import { set } from "../utils/set";

export function WeatherClockModule() {
  const weatherAndClockContainer = create(
    "section",
    "module weather-clock-module flex flex-row gap-5 rounded-xl bg-accent-yellow/40",
  );

  const clockContainer = create(
    "div",
    "clock-container flex h-full w-full content-start items-center justify-center rounded-xl bg-purple text-center",
  );
  set(time(), clockContainer);

  const dateContainer = create(
    "div",
    "date-container flex h-full w-full items-center justify-center rounded-xl bg-purple text-center",
  );
  set(date(), dateContainer);

  const clockAndDateContainer = create(
    "div",
    "clock-date-container flex w-full flex-col items-center gap-5",
  );
  set([clockContainer, dateContainer], clockAndDateContainer);

  const weatherContainer = create(
    "div",
    "weather-container flex w-full flex-col justify-center rounded-xl bg-purple",
  );

  async function updateWeather() {
    weatherContainer.innerHTML = "";

    fetchWeather()
      .then((data) => {
        const temp = create(
          "p",
          "weather-temp p-3 text-center text-6xl font-bold tracking-wider text-secondary-white",
        );
        const icon = weatherIcon(data.weather[0].description);
        temp.textContent = `${Math.round(data.main.temp)}°C`;

        set([icon, temp], weatherContainer);
      })
      .catch((err) => {
        const error = create(
          "p",
          "weather-error font-bold text-secondary-white",
        );
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
