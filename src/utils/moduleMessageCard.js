import { create } from "./create.js";

export function createModuleMessageCard(message, wrapperTag = "div") {
  const wrapper = create(
    wrapperTag,
    "flex h-full items-center justify-center rounded-xl bg-secondary-white/40 p-8 text-center",
  );

  const text = create(
    "p",
    "w-full text-2xl font-bold tracking-wide text-balance text-primary-blue",
  );
  text.textContent = message;

  wrapper.append(text);
  return wrapper;
}
