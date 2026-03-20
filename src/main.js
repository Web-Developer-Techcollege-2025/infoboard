import { get } from "./utils/get.js";
import { create } from "./utils/create.js";
import { set } from "./utils/set.js";
import { BackgroundGradient } from "./BackgroundGradient.js";

import { ActivitiesModule } from "./modules/Activities.js";
import { MenuModule } from "./modules/Menu.js";
import { RejseplanenModule } from "./modules/Rejseplanen.js";
import { WeatherClockModule } from "./modules/WeatherAndClock.js";
import { DRNewsModule } from "./modules/DRNews.js";
import { popup } from "./modules/PopUp.js";

BackgroundGradient();

const app = get("#app");

const logo = create("img");
logo.src = "../public/logo.svg";
set(logo, app);

const grid = create("div", "app-grid");
set(grid, app);

(async () => {
  set(await ActivitiesModule(), grid);
  set(await MenuModule(), grid);
  set(await RejseplanenModule(), grid);
  set(await WeatherClockModule(), grid);
  set(await DRNewsModule(), grid);
  set(popup(), app)
})();
