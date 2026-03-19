import { get } from "./utils/get.js";
import { set } from "./utils/set.js";

import { ActivitiesModule } from "./modules/Activities.js";
import { MenuModule } from "./modules/Menu.js";
import { RejseplanenModule } from "./modules/Rejseplanen.js";
import { WeatherClockModule } from "./modules/WeatherAndClock.js";
import { DRNewsModule } from "./modules/DRNews.js";

const app = get("#app");

(async () => {
  set(await ActivitiesModule(), app);
  set(await MenuModule(), app);
  set(await RejseplanenModule(), app);
  set(await WeatherClockModule(), app);
  set(await DRNewsModule(), app);
})();
