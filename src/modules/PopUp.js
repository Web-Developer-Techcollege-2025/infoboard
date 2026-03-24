import { create } from "../utils/create.js";
import { PopUpContent } from "./PopUpContent.js";

export function popup() {
  const modal = create("div");
  modal.className =
    "hidden pop-up fixed flex items-center inset-0 justify-center";

  setInterval(() => {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 25_000);
  }, 420_000);

  modal.append(PopUpContent());

  return modal;
}
