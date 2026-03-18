import { get } from "./utils/get.js";
import { set } from "./utils/set.js";

import { DRNewsModule } from "./modules/DRNews.js";
import { MenuModule } from "./modules/Menu.js";
import { RejseplanenModule } from "./modules/Rejseplanen.js";
import { ActivitiesModule } from "./modules/Activities.js";
import { weatherAndClockModule } from "./modules/WeatherAndClock.js";

const app = get("#app");

(async () => {
  set(await DRNewsModule(), app);
  // set(await MenuModule(), app);
  set(await RejseplanenModule(), app);
  set(await ActivitiesModule(), app);
  set(await weatherAndClockModule(), app);
})();
