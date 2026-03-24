import { create } from "../utils/create.js";
import img from "../assets/images/haandvaerker.jpg"

export const PopUpContent = () =>{
    const section = create("section")

    const container = create("div")
    container.className = "flex w-2/3 h-auto bg-white/75 rounded-xl "

    const breakfastImg = create("img")
    breakfastImg.src = img
    breakfastImg.alt = "Bread"
    breakfastImg.className = "w-1/2 h-2/3 rounded-xl m-2"

    const textContainer = create("div")
    textContainer.className = "flex flex-col justify-center items-center"

    const h1 = create("h1")
    h1.textContent = "Fælles morgenmad på medie"
    h1.className = "text-5xl font-bold text-center w-full mb-6 text-orange/90"

    const p = create("p")
    p.textContent = "Husk at der er fælles morgenmad på Medieafdelingen mandag d. 30. marts kl. 9:30."
    p.className = "text-3xl font-normal text-center w-full text-orange/90"

    section.append(container)
    container.append(breakfastImg, textContainer)
    textContainer.append(h1, p)

    return container;
}