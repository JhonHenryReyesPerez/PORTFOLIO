/**
 * Utilidades de DOM. Todo el texto se inserta con textContent,
 * así que los datos nunca se interpretan como HTML.
 */

/**
 * Crea un elemento con atributos e hijos.
 * @param {string} tag
 * @param {Record<string, string | boolean | null | undefined>} [attrs]
 * @param {Array<Node | string | null | false | undefined> | Node | string} [children]
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'text') node.textContent = String(value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}

/**
 * Crea un icono SVG que usa un símbolo del sprite de index.html.
 * @param {string} id Identificador del símbolo sin "#i-", por ejemplo "arrow-up-right".
 * @param {string} [extraClass]
 */
export function icon(id, extraClass = '') {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', `icon ${extraClass}`.trim());
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', `#i-${id}`);
  svg.append(use);
  return svg;
}

/** Bloque de error amigable con la causa técnica en segundo plano. */
export function errorNote(message, error) {
  return el('div', { class: 'error-note', role: 'alert' }, [
    el('p', { text: message }),
    el('p', { text: `Detalle: ${error?.message ?? 'error desconocido'}. Recarga la página para intentarlo de nuevo.` }),
  ]);
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
