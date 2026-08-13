type Child = string | Node | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, any> = {},
  children: Child[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== undefined && v !== null && v !== false) {
      node.setAttribute(k, String(v));
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function statBar(label: string, value: number, color: string) {
  return el('div', { class: 'statbar' }, [
    el('div', { class: 'statbar-label' }, [`${label}`]),
    el('div', { class: 'statbar-track' }, [
      el('div', {
        class: 'statbar-fill',
        style: { width: `${Math.round(value)}%`, background: color },
      }),
    ]),
  ]);
}
