import { prefersReducedMotion } from '../dom.js';

/**
 * Luz suave que sigue al puntero con un ligero retraso y revela una rejilla de puntos
 * (inspirado en el momento "cursor-spotlight" de Taste).
 * Las variables se escriben en la propia capa de luz, no en la sección, para no
 * recalcular los estilos de todos sus hijos en cada fotograma.
 * En pantallas táctiles y con movimiento reducido la luz queda quieta en su sitio.
 */
const REST = { x: 0.74, y: 0.42 };
const FOLLOW = 0.12; // Fracción de la distancia recorrida por fotograma (el "retraso")

export function initSpotlight() {
  const host = document.querySelector('[data-spotlight]');
  if (!host) return;

  const light = document.createElement('div');
  light.className = 'spotlight__light';
  light.setAttribute('aria-hidden', 'true');
  host.prepend(light);

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer || prefersReducedMotion()) return;

  let target = { ...REST };
  let current = { ...REST };
  let frame = 0;

  const paint = () => {
    light.style.setProperty('--x', `${(current.x * 100).toFixed(2)}%`);
    light.style.setProperty('--y', `${(current.y * 100).toFixed(2)}%`);
  };

  const tick = () => {
    frame = 0;
    current.x += (target.x - current.x) * FOLLOW;
    current.y += (target.y - current.y) * FOLLOW;
    paint();
    const moving = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.001;
    if (moving) frame = requestAnimationFrame(tick);
  };

  const request = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  host.addEventListener('pointermove', (event) => {
    const rect = host.getBoundingClientRect();
    target = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
    request();
  }, { passive: true });

  host.addEventListener('pointerleave', () => {
    target = { ...REST };
    request();
  });
}
