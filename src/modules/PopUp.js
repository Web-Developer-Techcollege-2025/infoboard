import { create } from "../utils/create.js";

export function popup() {
      const modal = create("div");
      modal.className = "hidden fixed inset-0 flex items-center justify-center";

      const content = create("div");
      content.className = "w-64 h-64 bg-black";
      modal.appendChild(content);

      setInterval(() => {
          modal.classList.remove("hidden");
          setTimeout(() => {
              modal.classList.add("hidden");
          }, 10_000);
      }, 10_000);

      return modal;
  }
