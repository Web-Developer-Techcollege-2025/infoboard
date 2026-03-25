import { create } from "../utils/create.js";
import img from "../assets/images/haandvaerker.jpg";

export const PopUpContent = () => {
  const section = create("section");

  const container = create("div", "flex w-2/3 h-auto bg-white/75 rounded-xl p-4 gap-4");

  const breakfastImg = create("img", "h-2/3 w-1/2 rounded-xl");
  breakfastImg.src = img;
  breakfastImg.alt = "Bread";

  const textContainer = create(
    "div",
    "flex flex-col items-center justify-center",
  );

  const h1 = create(
    "h1",
    "mb-6 w-full text-center text-5xl leading-tight font-bold text-balance text-orange/90",
  );
  h1.textContent = "Fælles morgenmad på medie";

  const p = create(
    "p",
    "w-full text-center text-3xl leading-tight font-normal text-balance text-orange/90",
  );
  p.textContent =
    "Husk at der er fælles morgenmad på Medieafdelingen mandag d. 30. marts kl. 9:30.";

  section.append(container);
  container.append(breakfastImg, textContainer);
  textContainer.append(h1, p);

  return container;
};
