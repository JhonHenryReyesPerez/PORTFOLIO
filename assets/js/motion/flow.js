import { prefersReducedMotion } from '../dom.js';

/**
 * Diagramas de flujo: un pulso recorre las capas del sistema.
 * Corre tres ciclos cuando el diagrama entra en pantalla y luego descansa
 * (nada se mueve por su cuenta más de ~10 s). Al pasar el puntero vuelve a correr.
 */
export function initFlows(scope = document) {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      play(entry.target);
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -20% 0px' });

  for (const flow of scope.querySelectorAll('[data-flow]')) {
    observer.observe(flow);
    flow.addEventListener('pointerenter', () => {
      if (!flow.getAnimations({ subtree: true }).some((a) => a.playState === 'running')) play(flow);
    });
  }
}

function play(flow) {
  flow.classList.remove('is-live');
  void flow.offsetWidth; // Reinicia las animaciones CSS
  flow.classList.add('is-live');
}
