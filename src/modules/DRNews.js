import { drNewsAPI } from "../data/DRNewsAPI";
import { create } from "../utils/create";
import { set } from "../utils/set";

export function DRNewsModule() {
  const drNewsContainer = create("div", "dr-news-container");

  const drNewsData = drNewsAPI();
  drNewsData;

  const heading = create("h2", "heading");
  set(heading, drNewsContainer);

  for (let i = 0; i < 3; i++) {
    const newsItemContainer = create("div", "news-item");
    const timeCategoryWrapper = create("div", "time-category-wrapper");

    const time = create("span", "time-since");
    time.textContent = `Nyt fra DR - for ${Math.floor(Math.random() * 60)} min. siden`; //Replace with the below when timeSince is calculated
    // time.textContent = `${timeSince} min. siden`

    let category = ["Sport", "Kultur", "Politik", "Underholdning", "Videnskab"]; //Random category generator for news items, replace with the below
    // let category = drNewsAPI().items.category //Replace with actual category from API
    let categoryItem = create("span", "category");
    categoryItem.textContent =
      category[Math.floor(Math.random() * category.length)];
    //let timeSince = Date() //Calculate time since news was posted through items.pubDate: "2026-03-16 08:32:00"; needs conversion to minutes

    let paragraph = create("p", "news-paragraph");
    paragraph.textContent = "Dette er en eksempel nyhedsartikel fra DR.";

    set([time, categoryItem], timeCategoryWrapper);
    set([timeCategoryWrapper, paragraph], newsItemContainer);
    set(newsItemContainer, drNewsContainer);
  }
  return drNewsContainer;
}
