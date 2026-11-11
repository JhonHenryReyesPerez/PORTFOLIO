import { getProjects } from './api.js';
import { el, errorNote, prefersReducedMotion } from './dom.js';
import { renderProject, renderOther } from './project-card.js';
import { initFlows } from './motion/flow.js';

/**
 * Sección de proyectos: carga projects.json, pinta los destacados y los demás,
 * y filtra ambas listas por categoría con una transición corta.
 */
const ALL = 'todos';
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
// Retrasos decrecientes: la lista entra como una onda, no como un metrónomo
const ENTER_DELAYS = [0, 55, 100, 135, 160, 180, 195, 205];

let filterRun = 0;

export async function initProjects() {
  const list = document.querySelector('[data-projects]');
  const othersBlock = document.querySelector('[data-others-block]');
  const othersList = document.querySelector('[data-others]');
  const filters = document.querySelector('[data-filters]');
  const status = document.querySelector('[data-filter-status]');
  if (!list || !othersBlock || !othersList || !filters || !status) return;

  try {
    const { categories, projects } = await getProjects();
    const labels = new Map(categories.map((c) => [c.id, c.label]));

    const featured = projects.filter((p) => p.featured);
    const others = projects.filter((p) => !p.featured);

    list.replaceChildren(...featured.map((p) => renderProject(p, labels)));
    list.append(el('p', { class: 'loading-note', 'data-empty': true, hidden: true, text: 'No hay proyectos destacados en esta categoría; mira la lista de abajo.' }));
    othersList.replaceChildren(...others.map(renderOther));
    othersBlock.hidden = others.length === 0;

    const items = [...list.querySelectorAll('[data-category]'), ...othersList.querySelectorAll('[data-category]')];
    renderFilters(filters, categories, projects);
    filters.hidden = false;

    // Posición inicial sin transición; después, cada cambio se desliza
    const indicator = filters.querySelector('.filters__active');
    indicator.style.transition = 'none';
    moveIndicator(filters);
    requestAnimationFrame(() => requestAnimationFrame(() => { indicator.style.transition = ''; }));
    new ResizeObserver(() => moveIndicator(filters)).observe(filters);
    document.fonts?.ready.then(() => moveIndicator(filters));

    filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button || button.getAttribute('aria-pressed') === 'true') return;

      for (const b of filters.querySelectorAll('[data-filter]')) {
        b.setAttribute('aria-pressed', String(b === button));
      }
      moveIndicator(filters);
      applyFilter(button.dataset.filter, { items, list, othersBlock, status, labels });
    });

    initFlows(list);
    playEntranceWhenVisible(list);
  } catch (error) {
    list.replaceChildren(errorNote('No se pudieron cargar los proyectos.', error));
  } finally {
    list.removeAttribute('aria-busy');
  }
}

/* ---------- Filtros ---------- */

function renderFilters(container, categories, projects) {
  const count = (id) => projects.filter((p) => id === ALL || p.category === id).length;
  const options = [{ id: ALL, label: 'Todos' }, ...categories.filter((c) => count(c.id) > 0)];

  const button = (option, interactive) => el(interactive ? 'button' : 'span', {
    class: 'filter',
    type: interactive ? 'button' : null,
    'data-filter': interactive ? option.id : null,
    'aria-pressed': interactive ? String(option.id === ALL) : null,
  }, [
    option.label,
    el('span', { class: 'filter__count', 'aria-hidden': 'true', text: String(count(option.id)) }),
  ]);

  // Capa base con los botones reales y una copia "activa" encima, recortada con clip-path
  // al botón seleccionado: al cambiar de filtro el recorte se desliza (receta de Emil Kowalski).
  const list = el('div', { class: 'filters__list' }, options.map((o) => button(o, true)));
  const active = el('div', { class: 'filters__active', 'aria-hidden': 'true' }, options.map((o) => button(o, false)));
  container.replaceChildren(list, active);
}

/** Recorta la capa activa al botón seleccionado. */
function moveIndicator(container) {
  const active = container.querySelector('.filters__active');
  const pressed = container.querySelector('[aria-pressed="true"]');
  if (!active || !pressed) return;

  const box = container.getBoundingClientRect();
  const r = pressed.getBoundingClientRect();
  const top = r.top - box.top;
  const left = r.left - box.left;
  const right = box.width - (left + r.width);
  const bottom = box.height - (top + r.height);
  active.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`;
}

async function applyFilter(category, { items, list, othersBlock, status, labels }) {
  const run = ++filterRun;
  const reduce = prefersReducedMotion();
  const matches = (item) => category === ALL || item.dataset.category === category;

  items.forEach((item) => item.getAnimations().forEach((a) => a.cancel()));

  // Salida: simultánea y corta (el usuario ya decidió cambiar)
  const leaving = items.filter((item) => !item.hidden && !matches(item));
  if (!reduce && leaving.length) {
    await Promise.all(leaving.map((item) =>
      item.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-out', fill: 'forwards' })
        .finished.catch(() => {})));
    if (run !== filterRun) return; // Otro filtro empezó mientras salían
  }

  const entering = [];
  for (const item of items) {
    const show = matches(item);
    if (show && item.hidden) entering.push(item);
    item.hidden = !show;
    item.getAnimations().forEach((a) => a.cancel());
  }

  const featuredVisible = [...list.querySelectorAll('.project')].filter((p) => !p.hidden).length;
  const othersVisible = [...othersBlock.querySelectorAll('.other')].filter((o) => !o.hidden).length;
  list.querySelector('[data-empty]').hidden = featuredVisible > 0;
  othersBlock.hidden = othersVisible === 0;

  const total = featuredVisible + othersVisible;
  const name = category === ALL ? 'todas las categorías' : labels.get(category);
  status.textContent = `Mostrando ${total} ${total === 1 ? 'proyecto' : 'proyectos'} de ${name}.`;

  if (!reduce) animateIn(entering, 6, 260);
}

/* ---------- Entrada de la lista ---------- */

function playEntranceWhenVisible(list) {
  const rows = [...list.querySelectorAll('.project')];
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  // Solo se anima si la lista aún no está en pantalla; si ya se ve, no se oculta
  const rect = list.getBoundingClientRect();
  if (rect.top < window.innerHeight) return;

  rows.forEach((row) => row.classList.add('is-pending'));
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    observer.disconnect();
    rows.forEach((row) => row.classList.remove('is-pending'));
    animateIn(rows.slice(0, 2), 10, 420);
    rows.slice(2).forEach((row) => row.classList.remove('is-pending'));
  }, { rootMargin: '0px 0px -12% 0px' });
  observer.observe(list);
}

function animateIn(elements, distance, duration) {
  elements.forEach((element, i) => {
    element.animate(
      [
        { opacity: 0, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration, delay: ENTER_DELAYS[Math.min(i, ENTER_DELAYS.length - 1)], easing: EASE_OUT, fill: 'backwards' },
    );
  });
}
