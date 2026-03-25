import { create } from "../utils/create.js";
import { PopUpContent } from "./PopUpContent.js";

export function popup() {
  const modal = create(
    "div",
    "pop-up fixed inset-0 flex hidden items-center justify-center",
  );

  setInterval(() => {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 25_000); /* Shows for 25 seconds */
  }, 420_000); /* Every 7 minutes */

  modal.append(PopUpContent());

  return modal;
}
