//import {rejseplanenAPI} from "../data/RejseplanenAPI"
import {create} from "../utils/create"
import {set} from "../utils/set"


export function rejseplanenModule(){

    const rejseplanenContainer = create("div","rejseplanen-container")
    
    const busTimes = create ("h2")

    busTimes.textContent = "BUSTIDER"

    

    set(busTimes, rejseplanenContainer)

    return rejseplanenContainer

}