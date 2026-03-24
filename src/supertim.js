import { create } from "./utils/create";
import superTimImage from "./assets/images/superTim.png";

export function superTim() {
  const modal = create("div", "z-999");
  modal.className = "hidden fixed inset-0 items-end justify-center";

  const container = create("div");
  container.className =
    "flex flex-col items-center justify-center bg-transparent p-6 shadow-none animate-slide-in w-30";

  const img = create("img");
  img.src = superTimImage;
  img.alt = "supertim";

  const h2 = create("h2");
  h2.textContent = "SUPERTIM!!!";
  h2.classList.add("text-[0.4rem]")

  setInterval(() => {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 5_000);
  }, 7_200_000);

  modal.append(container);
  container.append(img, h2);

  return modal;
}
