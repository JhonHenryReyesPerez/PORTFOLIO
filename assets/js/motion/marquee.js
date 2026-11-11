import { prefersReducedMotion, icon } from '../dom.js';

/**
 * Cinta de tecnologías que se desplaza en bucle (inspirada en "marquee-row" de Taste).
 * - Solo corre mientras está en pantalla.
 * - Se detiene al pasar el puntero y tiene un botón de pausa (corre más de 5 s).
 * - Sin JavaScript o con movimiento reducido, las palabras quedan en una fila envuelta.
 */
const SPEED = 40; // píxeles por segundo

export function initMarquee() {
  const root = document.querySelector('[data-marquee]');
  const track = root?.querySelector('.marquee__track');
  if (!root || !track || prefersReducedMotion()) return;

  // Copia de la lista para que el bucle no tenga cortes; los lectores de pantalla la ignoran
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  const rail = document.createElement('div');
  rail.className = 'marquee__rail';
  track.replaceWith(rail);
  rail.append(track, clone);

  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'icon-btn marquee__pause';
  root.append(pause);

  // Este botón pausa todo lo que se mueve solo en el inicio: la cinta y la aurora del fondo
  const setPaused = (paused) => {
    root.classList.toggle('is-paused', paused);
    document.documentElement.classList.toggle('is-motion-paused', paused);
    pause.setAttribute('aria-label', paused ? 'Reanudar las animaciones del inicio' : 'Pausar las animaciones del inicio');
    pause.replaceChildren(icon(paused ? 'play' : 'pause'));
  };
  setPaused(false);
  pause.addEventListener('click', () => setPaused(!root.classList.contains('is-paused')));

  const fit = () => {
    const width = track.scrollWidth;
    root.style.setProperty('--w', `${width}px`);
    root.style.setProperty('--dur', `${(width / SPEED).toFixed(2)}s`);
  };

  root.classList.add('is-live');
  fit();
  document.fonts?.ready.then(fit);
  new ResizeObserver(fit).observe(track);

  new IntersectionObserver((entries) => {
    root.classList.toggle('is-on', entries[entries.length - 1].isIntersecting);
  }).observe(root);
}
