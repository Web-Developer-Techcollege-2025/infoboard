export const easterEgg = () =>{
    const section = document.createElement("section")

    const container = document.createElement("div")


    const breakfastImg = document.createElement("img")
    breakfastImg.src = "../public/breakfast.jpeg"
    breakfastImg.alt = "Bread"

    const textContainer = document.createElement("div")

    const h1 = document.createElement("h1")
    h1.textContent = "Fælles morgenmad på medie"

    const p = document.createElement("p")
    p.textContent = "Husk at der er fælles morgenmad på Medieafdelingen mandag d. 30. marts kl. 9:30."

    section.append(container)
    container.append(breakfastImg, textContainer)
    textContainer.append(h1, p)

    return section;
}