import { create } from "../utils/create.js";
import { PopUpContent } from "./PopUpContent.js";

export function popup() {
  const modal = create("div");
  modal.className =
    "pop-up fixed flex items-center inset-0 justify-center"; /* hidden */

  /*  setInterval(() => {
       modal.classList.remove("hidden");
       setTimeout(() => {
           modal.classList.add("hidden");
       }, 30_000);
   }, 600_000);
*/
  modal.append(PopUpContent());

  return modal;
}
