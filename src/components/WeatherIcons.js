import Cloudy from "../assets/images/infoboardIconCloudy.svg";
import Fog from "../assets/images/infoboardIconFog.svg";
import MostyCloudy from "../assets/images/infoboardIconMostyCloudy.svg";
import Rain from "../assets/images/infoboardIconRain.svg";
import Snow from "../assets/images/infoboardIconSnow.svg";
import Sunny from "../assets/images/infoboardIconSunny.svg";
import Windy from "../assets/images/infoboardIconWindy.svg";

import { set } from "../utils/set";
import { create } from "../utils/create";

const iconMap = {
  "clear sky": Sunny,
  "few clouds": MostyCloudy,
  "scattered clouds": MostyCloudy,
  "broken clouds": Cloudy,
  "overcast clouds": Cloudy,
  "light rain": Rain,
  "moderate rain": Rain,
  "heavy rain": Rain,
  "heavy intensity rain": Rain,
  "light snow": Snow,
  snow: Snow,
  mist: Fog,
  fog: Fog,
  windy: Windy,
};

export function weatherIcon(description) {
  const container = create("div", "weather-icon px-10 pt-5 pb-5");
  const icon = iconMap[description];

  if (!icon) return container;

  const img = create("img", "weather-icon-img");
  img.src = icon;

  set(img, container);
  return container;
}
