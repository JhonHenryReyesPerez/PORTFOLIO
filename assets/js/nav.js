/**
 * Navegación: menú móvil, sección activa (scroll spy),
 * estado de la cabecera al hacer scroll y botón "volver arriba".
 */
export function initNav() {
  initMenu();
  initScrollSpy();
  initScrollState();
}

function initMenu() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-nav-panel]');
  if (!toggle || !panel) return;

  const label = toggle.querySelector('.visually-hidden');
  const iconUse = toggle.querySelector('use');
  const mobile = window.matchMedia('(max-width: 767.98px)');

  const setOpen = (open, { returnFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    iconUse?.setAttribute('href', open ? '#i-close' : '#i-menu');
    if (open) panel.querySelector('a')?.focus();
    else if (returnFocus) toggle.focus();
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches) setOpen(false);
  });
}

function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const update = () => {
    // La sección activa es la primera (en orden del documento) que ocupa la franja central
    const current = sections.find((s) => visible.has(s));
    for (const link of links) {
      if (current && link.getAttribute('href') === `#${current.id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    update();
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => observer.observe(s));
}

function initScrollState() {
  const header = document.querySelector('[data-header]');
  const toTop = document.querySelector('[data-to-top]');
  const hero = document.querySelector('#inicio');
  if (!hero || !('IntersectionObserver' in window)) return;

  // Cabecera sólida en cuanto se deja el borde superior de la página
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;height:8px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    header?.classList.toggle('is-scrolled', !entry.isIntersecting);
  }).observe(sentinel);

  // "Volver arriba" aparece cuando el hero ya no se ve
  new IntersectionObserver(([entry]) => {
    toTop?.classList.toggle('is-visible', !entry.isIntersecting);
  }).observe(hero);
}
