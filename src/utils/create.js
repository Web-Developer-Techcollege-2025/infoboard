export function create(el, classes) {
  const element = document.createElement(el);
  if (classes) element.className = classes;
  return element;
}
