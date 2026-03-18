import { fetchRejseplanen } from "../data/RejseplanenAPI.js";
import { create } from "../utils/create.js";
import { set } from "../utils/set.js";

export async function RejseplanenModule() {
  const rejseplanenContainer = create("section", "rejseplanen-module module");

  const busTimes = create("h2", "rejseplanen-heading");

  busTimes.textContent = "BUSTIDER";

  try {
    await fetchRejseplanen();
  } catch {
    busTimes.textContent = "BUSTIDER - utilgængelig";
  }

  set(busTimes, rejseplanenContainer);

  return rejseplanenContainer;
}
