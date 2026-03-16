export function set(element, target) {
  if (Array.isArray(element)) {
    element.forEach((el) => target.appendChild(el));
  } else target.appendChild(element);
}
