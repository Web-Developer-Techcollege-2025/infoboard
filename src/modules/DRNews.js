import QRCode from "qrcode";
import { getCachedDRNews } from "../data/timers/DRNewsScheduler.js";
import { create } from "../utils/create.js";
import { createModuleMessageCard } from "../utils/moduleMessageCard.js";
import { set } from "../utils/set.js";

const BATCH_SIZE = 3;

export async function DRNewsModule() {
  const drNewsModule = create(
    "section",
    "dr-news-module module col-span-2 col-start-2",
  );

  let currentIndex = 0;
  let renderIntervalId = null;
  let isRendering = false;

  try {
    let items = await getCachedDRNews();

    const newsWrapper = create(
      "div",
      "news-wrapper flex h-full flex-row justify-center gap-5 rounded-xl text-lg font-medium text-white",
    );
    set(newsWrapper, drNewsModule);

    async function renderBatch() {
      if (isRendering) {
        return;
      }

      try {
        const latestItems = await getCachedDRNews();
        if (Array.isArray(latestItems)) {
          items = latestItems;
        }
      } catch (error) {
        // Keep existing list if a refresh fails.
        console.warn("Could not refresh DR news list", error);
      }

      if (currentIndex >= items.length) {
        currentIndex = 0;
      }

      if (!items.length) {
        newsWrapper.innerHTML = "";
        set(
          createModuleMessageCard("Nyheder er ikke tilgængelige lige nu"),
          newsWrapper,
        );
        return;
      }

      isRendering = true;

      try {
        newsWrapper.querySelectorAll(".news-item").forEach((el) => el.remove());

        const batchCount = Math.min(BATCH_SIZE, items.length);

        for (let i = 0; i < batchCount; i++) {
          const item = items[(currentIndex + i) % items.length];

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

        currentIndex = (currentIndex + batchCount) % items.length;
      } catch (error) {
        console.error("Error rendering DR news batch:", error);
        newsWrapper.innerHTML = "";
        set(
          createModuleMessageCard("Nyheder er midlertidigt utilgængelige"),
          newsWrapper,
        );
      } finally {
        isRendering = false;
      }
    }

    await renderBatch();
    renderIntervalId = setInterval(renderBatch, 120_000);

    drNewsModule.destroyModule = () => {
      if (renderIntervalId) {
        clearInterval(renderIntervalId);
      }
    };
  } catch (error) {
    console.error("Error rendering DR news:", error);

    const fallbackHeading = create("h2");
    fallbackHeading.textContent = "DR NYHEDER";

    const fallbackCard = createModuleMessageCard(
      "Nyheder er midlertidigt utilgængelige",
    );

    set([fallbackHeading, fallbackCard], drNewsModule);
  }

  return drNewsModule;
}
