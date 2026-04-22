import { create } from "../utils/create.js";
import { PopUpContent } from "./PopUpContent.js";

export function popup() {
  const modal = create(
    "div",
    "pop-up fixed inset-0 hidden items-center justify-center",
  );

  let showIntervalId = null;
  let hideTimeoutId = null;

  showIntervalId = setInterval(() => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    hideTimeoutId = setTimeout(() => {
      modal.classList.add("hidden");
    }, 25_000); /* Shows for 25 seconds */
  }, 420_000); /* Every 7 minutes */

  modal.destroyModule = () => {
    if (showIntervalId) {
      clearInterval(showIntervalId);
    }
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }
  };

  modal.append(PopUpContent());

  return modal;
}
