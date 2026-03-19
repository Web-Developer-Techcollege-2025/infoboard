// Displays DR News items in batches of 3, cycling through all available items every 10 seconds
import { getCachedDRNews } from "../data/timers/DRNewsScheduler.js";

import { create } from "../utils/create.js";
import { set } from "../utils/set.js";
import NoImageIcon from "../assets/images/infoboardIconNoImage.svg";

let currentIndex = 0;

export async function DRNewsModule() {
  const drNewsModule = create(
    "section",
    "dr-news-module module col-span-2 col-start-2 bg-blue/40",
  );
  const heading = create("h2", "font-black text-secondary-white");
  heading.textContent = "DR - SENESTE NYT";
  set(heading, drNewsModule);

  try {
    const items = await getCachedDRNews();
    // Trim items to only full batches of 3
    const usableItems = items.slice(0, Math.floor(items.length / 3) * 3);

    const newsWrapper = create(
      "div",
      "news-wrapper flex h-full flex-row justify-center gap-10 rounded-xl text-5xl font-medium text-white",
    );
    set(newsWrapper, drNewsModule);

    function renderBatch() {
      // Clear previous batch before rendering the next
      newsWrapper.querySelectorAll(".news-item").forEach((el) => el.remove());

      for (let i = 0; i < 3; i++) {
        const item = usableItems[currentIndex + i];

        // Convert pubDate to minutes or hours since published
        const published = new Date(item.pubDate.replace(" ", "T"));
        const minutesAgo = Math.floor(
          (Date.now() - published.getTime()) / 60000,
        );
        const timeSince =
          minutesAgo < 60
            ? `${minutesAgo} min. siden`
            : `${Math.floor(minutesAgo / 60)} t. siden`;

        // Format pubDate as Danish date and time
        const pubDate = `${published.getDate()}/${published.getMonth() + 1}-${String(published.getFullYear()).slice(2)}`;
        const pubTime = `kl. ${String(published.getHours()).padStart(2, "0")}:${String(published.getMinutes()).padStart(2, "0")}`;

        const newsItemContainer = create(
          "div",
          "news-item flex w-full flex-col rounded-xl bg-blue/50",
        );

        // Set background image if available, fallback to bg-blue/50
        if (item.enclosure?.link) {
          newsItemContainer.style.backgroundImage = `url(${item.enclosure.link})`;
          newsItemContainer.style.backgroundSize = "cover";
          newsItemContainer.style.backgroundPosition = "center";
        } else {
          // Show no-image icon when no image is available
          const noImageContainer = create(
            "div",
            "no-image-placeholder absolute inset-0 flex items-center justify-center rounded-xl opacity-40",
          );
          const noImageImg = create("img", "no-image-icon");
          noImageImg.src = NoImageIcon;
          noImageImg.style.width = "50%";
          noImageImg.style.height = "50%";
          noImageImg.style.color = "white";
          set(noImageImg, noImageContainer);
          newsItemContainer.style.position = "relative";
          set(noImageContainer, newsItemContainer);
        }

        const overlay = create(
          "div",
          "overlay flex h-full w-full flex-col justify-between rounded-lg bg-linear-to-t from-black/70 to-transparent p-10 tracking-wide",
        );

        const timeCategoryWrapper = create(
          "div",
          "time-category-wrapper flex justify-between",
        );

        const timeSinceLabel = create("span", "time-since");
        timeSinceLabel.textContent = timeSince;

        const pubDateLabel = create("span", "pub-date");
        pubDateLabel.textContent = `${pubDate} ${pubTime}`;

        const paragraph = create(
          "p",
          "news-paragraph leading-tight wrap-break-word",
        );
        paragraph.textContent = item.title;

        set([timeSinceLabel, pubDateLabel], timeCategoryWrapper);
        set([timeCategoryWrapper, paragraph], overlay);
        set(overlay, newsItemContainer);
        set(newsItemContainer, newsWrapper);
      }

      // Advance index and loop back to 0 when all batches have been shown
      currentIndex = (currentIndex + 3) % usableItems.length;
    }

    renderBatch();
    setInterval(renderBatch, 10000); // Change news batch every 10 seconds
  } catch {
    heading.textContent = "DR Nyheder - utilgængelig";
  }

  return drNewsModule;
}
