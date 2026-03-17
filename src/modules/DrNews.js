// import { DrNewsAPI } from "../data/DrNewsAPI.js"
import {Create} from "../utils/Create"
import {Set} from "../utils/Set"

export function DrNewsModule(){
const drNewsContainer = Create("div", "dr-news-container")

const heading = Create("h2", "heading")
Set(heading, drNewsContainer)

    for (let i = 0; i < 3; i++){
        const newsItemContainer = Create("div", "news-item")
        const timeCategoryWrapper = Create("div", "time-category-wrapper")

        const time = Create("span", "time-since")
        time.textContent = `Nyt fra DR - for ${Math.floor(Math.random() * 60)} min. siden` //Replace with the below when timeSince is calculated
        // time.textContent = `${timeSince} min. siden`

        let category = ["Sport", "Kultur", "Politik", "Underholdning", "Videnskab"] //Random category generator for news items, replace with the below
        // let category = DrNewsAPI.items.category //Replace with actual category from API
        let categoryItem = Create("span", "category")
        categoryItem.textContent = category[Math.floor(Math.random() * category.length)]
        //let timeSince = Date() //Calculate time since news was posted through items.pubDate: "2026-03-16 08:32:00"; needs conversion to minutes

        let paragraph = Create("p", "news-paragraph")
        paragraph.textContent = "Dette er en eksempel nyhedsartikel fra DR."

        Set([time, categoryItem], timeCategoryWrapper)
        Set([timeCategoryWrapper, paragraph], newsItemContainer)
        Set(newsItemContainer, drNewsContainer)

    }
    return drNewsContainer
}


