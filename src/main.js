import "./style.css";

import { get } from "./utils/get.js";
import { create } from "./utils/create.js";
import { set } from "./utils/set.js";
import { createModuleMessageCard } from "./utils/moduleMessageCard.js";
import { BackgroundGradient } from "./BackgroundGradient.js";

import { ActivitiesModule } from "./modules/Activities.js";
import { MenuModule } from "./modules/Menu.js";
import { RejseplanenModule } from "./modules/Rejseplanen.js";
import { WeatherClockModule } from "./modules/WeatherAndClock.js";
import { DRNewsModule } from "./modules/DRNews.js";
import { superTim } from "./supertim.js";
// import { popup } from "./modules/PopUp.js"; /* DISABLED UNTIL NEW CONTENT IS READY */
import logoSrc from "./assets/images/logo.svg";

BackgroundGradient();

const app = get("#app");
const superTimElement = superTim();
set(superTimElement, app);

const h1 = create("h1", "w-2/9");

const logo = create("img", "h-auto w-full");
logo.src = logoSrc;
set(logo, h1);

const grid = create("div", "app-grid");
set([h1, grid], app);

// Create placeholder containers to preserve grid order during async loads
const modulePlaceholders = {
  activities: create("div", "contents"),
  menu: create("div", "contents"),
  rejseplanen: create("div", "contents"),
  weather: create("div", "contents"),
  drNews: create("div", "contents"),
};

set(
  [
    modulePlaceholders.activities,
    modulePlaceholders.menu,
    modulePlaceholders.rejseplanen,
    modulePlaceholders.weather,
    modulePlaceholders.drNews,
  ],
  grid,
);

function destroyElementModule(element) {
  if (typeof element?.destroyModule === "function") {
    element.destroyModule();
  }
}

async function mountModule(moduleFactory, container, moduleDisplayName) {
  try {
    [...container.children].forEach(destroyElementModule);
    container.innerHTML = "";

    const moduleElement = await moduleFactory();
    set(moduleElement, container);
  } catch (error) {
    console.error(`Failed to render ${moduleDisplayName}:`, error);
    container.innerHTML = "";

    const fallbackSection = create("section", "module");
    const fallbackHeading = create("h2");
    fallbackHeading.textContent = moduleDisplayName;

    const fallbackCard = createModuleMessageCard(
      "Modulet er midlertidigt utilgængeligt",
    );

    set([fallbackHeading, fallbackCard], fallbackSection);
    set(fallbackSection, container);
  }
}

function destroyMountedModules() {
  Object.values(modulePlaceholders).forEach((container) => {
    [...container.children].forEach(destroyElementModule);
  });
  destroyElementModule(superTimElement);
}

window.addEventListener("pagehide", (event) => {
  if (!event.persisted) {
    destroyMountedModules();
  }
});

(async () => {
  // Load all modules in parallel with individual error handling
  await Promise.allSettled([
    mountModule(ActivitiesModule, modulePlaceholders.activities, "SKEMA"),
    mountModule(MenuModule, modulePlaceholders.menu, "UGENS MENU"),
    mountModule(RejseplanenModule, modulePlaceholders.rejseplanen, "BUSTIDER"),
    mountModule(WeatherClockModule, modulePlaceholders.weather, "VEJR OG TID"),
    mountModule(DRNewsModule, modulePlaceholders.drNews, "DR NYHEDER"),
  ]);

  // DISABLE POPUP UNTIL NEW CONTENT IS READY (see also import at top)
  // try {
  //   set(popup(), app);
  // } catch (error) {
  //   console.error("Failed to render popup:", error);
  // }
})();
