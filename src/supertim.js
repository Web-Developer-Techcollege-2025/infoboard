import { create } from "./utils/create";
import superTimImage from "./assets/images/superTim.png";

export function superTim() {
  const modal = create(
    "div",
    "fixed inset-0 z-999 hidden items-end justify-center",
  );
  let showIntervalId = null;
  let hideTimeoutId = null;

  const container = create(
    "div",
    "flex w-30 animate-slide-in flex-col items-center justify-center bg-transparent p-6 shadow-none",
  );

  const img = create("img");
  img.src = superTimImage;
  img.alt = "supertim";

  const h2 = create("h2");
  h2.textContent = "SUPERTIM!!!";
  h2.classList.add("text-[0.5rem]");

  showIntervalId = setInterval(() => {
    modal.classList.remove("hidden");
    hideTimeoutId = setTimeout(() => {
      modal.classList.add("hidden");
    }, 5_000); /* Shows for 5 seconds */
  }, 7_200_000); /* Every 2 hours */

  modal.append(container);
  container.append(img, h2);

  modal.destroyModule = () => {
    if (showIntervalId) {
      clearInterval(showIntervalId);
    }
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }
  };

  return modal;
}
