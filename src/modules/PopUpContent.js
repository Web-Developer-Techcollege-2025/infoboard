import { create } from "../utils/create.js";
import img from "../assets/images/haandvaerker.jpg"

export const PopUpContent = () =>{
    const section = create("section")

    const container = create("div")
    container.className = "flex w-1/2 h-auto bg-light-blue/85 rounded-xl "

    const breakfastImg = create("img")
    breakfastImg.src = img
    breakfastImg.alt = "Bread"
    breakfastImg.className = "w-1/2 h-1/2 rounded-xl m-5"

    const textContainer = create("div")
    textContainer.className = "flex flex-col justify-center items-center"

    const h1 = create("h1")
    h1.textContent = "Fælles morgenmad på medie"
    h1.className = "text-2xl font-bold text-center w-2/3 mb-6 text-primary-red"

    const p = create("p")
    p.textContent = "Husk at der er fælles morgenmad på Medieafdelingen mandag d. 30. marts kl. 9:30."
    p.className = "text-lg font-normal text-center w-2/3 text-primary-red"

    section.append(container)
    container.append(breakfastImg, textContainer)
    textContainer.append(h1, p)

    return container;
}