import { create } from "./utils/create"

export function superTim(){
    const modal = create("div")
    modal.className = "hidden fixed inset-0 items-end justify-center"

    const container = create("div")
    container.className = "flex flex-col items-center justify-center bg-transparent p-6 shadow-none animate-slide-in"

    const img = create("img")
    img.src = "public/superTim.png"
    img.alt = "supertim"

    const h2 = create("h2")
    h2.textContent = "SUPERTIM!!!"

    setInterval(() => {
        modal.classList.remove("hidden")
        setTimeout(() => {
            modal.classList.add("hidden")
        }, 5_000);
    }, 50_000)

    modal.append(container)
    container.append(img, h2)

    return modal;
}