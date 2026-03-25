import QRCode from "qrcode";
import { getCachedDRNews } from "../data/timers/DRNewsScheduler.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

let currentIndex = 0;

export async function DRNewsModule() {
  const drNewsModule = create(
    "section",
    "dr-news-module module col-span-2 col-start-2 bg-blue/40",
  );

  try {
    const items = await getCachedDRNews();
    const usableItems = items.slice(0, Math.floor(items.length / 3) * 3);

    const newsWrapper = create(
      "div",
      "news-wrapper flex h-full flex-row justify-center gap-5 rounded-xl text-xl font-medium text-white",
    );
    set(newsWrapper, drNewsModule);

    async function renderBatch() {
      newsWrapper.querySelectorAll(".news-item").forEach((el) => el.remove());

      for (let i = 0; i < 3; i++) {
        const item = usableItems[currentIndex + i];

        const published = new Date(item.pubDate.replace(" ", "T"));
        const minutesAgo = Math.floor(
          (Date.now() - published.getTime()) / 60000,
        );
        const timeSince =
          minutesAgo < 60
            ? `${minutesAgo} min. siden`
            : `${Math.floor(minutesAgo / 60)} t. siden`;

        const pubDate = `${published.getDate()}/${published.getMonth() + 1}-${String(published.getFullYear()).slice(2)}`;
        const pubTime = `kl. ${String(published.getHours()).padStart(2, "0")}:${String(published.getMinutes()).padStart(2, "0")}`;

        const newsItemContainer = create(
          "div",
          "news-item flex w-full flex-col rounded-xl bg-blue/50",
        );

        if (item.enclosure?.link) {
          newsItemContainer.style.backgroundImage = `url(${item.enclosure.link})`;
          newsItemContainer.style.backgroundSize = "cover";
          newsItemContainer.style.backgroundPosition = "center";
        }

        const overlay = create(
          "div",
          "overlay relative flex h-full w-full flex-col gap-4 rounded-lg bg-linear-to-t from-black/70 to-transparent p-5 tracking-wide",
        );

        const qrCanvas = create("canvas", "qr-code z-10");
        await QRCode.toCanvas(qrCanvas, item.link, {
          width: 80,
          color: { light: "#00000000" },
        });

        const qrWrapper = create(
          "div",
          "absolute right-4 bottom-4 flex h-20 w-20 items-center justify-center self-end rounded-sm bg-white p-1",
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
          "news-paragraph text-2xl leading-tight wrap-break-word",
        );
        paragraph.textContent = item.title;

        set(qrCanvas, qrWrapper);
        set([timeSinceLabel, pubDateLabel], timeCategoryWrapper);
        set([timeCategoryWrapper, paragraph, qrWrapper], overlay);
        set(overlay, newsItemContainer);
        set(newsItemContainer, newsWrapper);
      }

      currentIndex = (currentIndex + 3) % usableItems.length;
    }

    await renderBatch();
    setInterval(renderBatch, 120000);
  } catch (error) {
    console.error("Error rendering DR news:", error);
  }

  return drNewsModule;
}
