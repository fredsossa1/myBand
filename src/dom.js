export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "dataset") {
      Object.entries(v).forEach(([dk, dv]) => (node.dataset[dk] = dv));
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.substring(2), v);
    } else if (v !== false && v != null) {
      node.setAttribute(k, v === true ? "" : v);
    }
  });
  children.flat().forEach((ch) => {
    if (ch == null) return;
    node.appendChild(typeof ch === "string" ? document.createTextNode(ch) : ch);
  });
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
