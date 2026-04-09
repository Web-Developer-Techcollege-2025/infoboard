import QRCode from "qrcode";
import { getCachedDRNews } from "../data/timers/DRNewsScheduler.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

let currentIndex = 0;

export async function DRNewsModule() {
  const drNewsModule = create(
    "section",
    "dr-news-module module col-span-2 col-start-2",
  );

  try {
    const items = await getCachedDRNews();
    const usableItems = items.slice(0, Math.floor(items.length / 3) * 3);

    const newsWrapper = create(
      "div",
      "news-wrapper flex h-full flex-row justify-center gap-5 rounded-xl text-lg font-medium text-white",
    );
    set(newsWrapper, drNewsModule);

    async function renderBatch() {
      newsWrapper.querySelectorAll(".news-item").forEach((el) => el.remove());

      for (let i = 0; i < 3; i++) {
        const item = usableItems[currentIndex + i];

        const published = new Date(item.pubDate.replace(" ", "T"));
        const now = new Date();
        const minutesAgo = Math.floor(
          (Date.now() - published.getTime()) / 60000,
        );
        const clampedMinutesAgo = Math.max(0, minutesAgo);

        let timeSince;
        if (clampedMinutesAgo < 30) {
          timeSince = "Lige nu";
        } else if (clampedMinutesAgo < 60) {
          timeSince = "30 m. siden";
        } else {
          const roundedHoursAgo = Math.round(clampedMinutesAgo / 60);
          timeSince = `${roundedHoursAgo} t. siden`;
        }

        const pubTime = `kl. ${String(published.getHours()).padStart(2, "0")}:${String(published.getMinutes()).padStart(2, "0")}`;

        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const publishedDay = new Date(
          published.getFullYear(),
          published.getMonth(),
          published.getDate(),
        );

        let pubDatePrefix;
        if (publishedDay.getTime() === today.getTime()) {
          pubDatePrefix = "I dag";
        } else if (publishedDay.getTime() === yesterday.getTime()) {
          pubDatePrefix = "I går";
        } else {
          const weekday = published.toLocaleDateString("da-DK", {
            weekday: "long",
          });
          pubDatePrefix = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        }

        const newsItemContainer = create(
          "div",
          "news-item flex w-full flex-col rounded-xl bg-purple",
        );

        if (item.enclosure?.link) {
          newsItemContainer.style.backgroundImage = `url(${item.enclosure.link})`;
          newsItemContainer.style.backgroundSize = "cover";
          newsItemContainer.style.backgroundPosition = "center";
        }

        const overlay = create(
          "div",
          "overlay flex h-full w-full flex-col justify-between rounded-lg bg-linear-to-t from-black/80 to-transparent p-5 tracking-wide",
        );

        const paragraphQRWrapper = create(
          "div",
          "paragraph-qr-wrapper flex items-end justify-between gap-5",
        );

        const qrCanvas = create("canvas", "qr-code z-10");
        await QRCode.toCanvas(qrCanvas, item.link, {
          width: 80,
          color: { light: "#00000000" },
        });

        const qrWrapper = create(
          "div",
          "qr-wrapper flex h-20 w-20 items-center justify-center self-end rounded-sm bg-white p-1",
        );

        const timeCategoryWrapper = create(
          "div",
          "time-category-wrapper flex justify-between text-lg",
        );

        const timeSinceLabel = create("span", "time-since");
        timeSinceLabel.textContent = timeSince;

        const pubDateLabel = create("span", "pub-date");
        pubDateLabel.textContent = `${pubDatePrefix} ${pubTime}`;

        const paragraph = create(
          "p",
          "news-paragraph align-bottom text-xl leading-snug wrap-break-word hyphens-auto",
        );
        paragraph.textContent = item.title;

        set(qrCanvas, qrWrapper);
        set([timeSinceLabel, pubDateLabel], timeCategoryWrapper);
        set([timeCategoryWrapper, paragraphQRWrapper], overlay);
        set([paragraph, qrWrapper], paragraphQRWrapper);
        set(overlay, newsItemContainer);
        set(newsItemContainer, newsWrapper);
      }

      currentIndex = (currentIndex + 3) % usableItems.length;
    }

    await renderBatch();
    setInterval(renderBatch, 120_000);
  } catch (error) {
    console.error("Error rendering DR news:", error);
  }

  return drNewsModule;
}
