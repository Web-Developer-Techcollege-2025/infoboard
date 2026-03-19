import { create } from "../utils/create.js";
import { easterEgg } from "../easter.js";

export function popup() {
  const modal = create("div");
  modal.className =
    "hidden fixed inset-0 flex items-center justify-center pop-up";

  setInterval(() => {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 5_000);
  }, 6_000);

  modal.append(easterEgg());

  return modal;
}
