import { prefersReducedMotion } from '../dom.js';

/**
 * Frase que se enciende palabra por palabra al cruzar el centro de la pantalla
 * (inspirada en "word-highlight" de Taste). Va ligada a la barra de scroll:
 * si el usuario sube, las palabras se apagan de nuevo.
 * Sin JavaScript o con movimiento reducido, la frase se ve completa desde el inicio.
 */
const FROM = 0.85; // La parte superior de la frase a este % de la pantalla enciende la primera palabra
const TO = 0.45;   // La parte inferior a este % enciende la última

export function initWordHighlight() {
  const text = document.querySelector('[data-word-highlight]');
  if (!text || prefersReducedMotion()) return;

  const words = splitWords(text);
  text.classList.add('is-live');

  let lit = -1;
  let frame = 0;

  const update = () => {
    frame = 0;
    const rect = text.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * FROM;
    const end = vh * TO;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, start - end + rect.height)));
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const count = atBottom ? words.length : Math.round(progress * words.length);

    if (count === lit) return;
    lit = count;
    words.forEach((word, i) => word.classList.toggle('is-on', i < count));
  };

  const request = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  // Solo escucha el scroll mientras la frase está cerca de la pantalla
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request, { passive: true });
      request();
    } else {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      request();
    }
  }, { rootMargin: '25% 0px' }).observe(text);

  update();
}

/** Envuelve cada palabra en un <span class="word">, respetando etiquetas como <strong>. */
function splitWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  const words = [];
  for (const node of nodes) {
    const parts = node.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        fragment.append(part);
      } else {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = part;
        fragment.append(span);
        words.push(span);
      }
    }
    node.replaceWith(fragment);
  }
  return words;
}
