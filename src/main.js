import "./style.css";

import { get } from "./utils/get.js";
import { create } from "./utils/create.js";
import { set } from "./utils/set.js";
import { BackgroundGradient } from "./BackgroundGradient.js";

import { ActivitiesModule } from "./modules/Activities.js";
import { MenuModule } from "./modules/Menu.js";
import { RejseplanenModule } from "./modules/Rejseplanen.js";
import { WeatherClockModule } from "./modules/WeatherAndClock.js";
import { DRNewsModule } from "./modules/DRNews.js";
import { superTim } from "./supertim.js";
import { popup } from "./modules/PopUp.js";
import logoSrc from "./assets/images/logo.svg";

BackgroundGradient();

const app = get("#app");
set(superTim(), app);

const h1 = create("h1", "w-2/9");

const logo = create("img", "h-auto w-full");
logo.src = logoSrc;
set(logo, h1);

const grid = create("div", "app-grid");
set([h1, grid], app);

(async () => {
  set(await ActivitiesModule(), grid);
  set(await MenuModule(), grid);
  set(await RejseplanenModule(), grid);
  set(await WeatherClockModule(), grid);
  set(await DRNewsModule(), grid);
  set(popup(), app);
})();
