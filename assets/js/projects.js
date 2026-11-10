import { getProjects } from './api.js';
import { el, icon, errorNote, prefersReducedMotion } from './dom.js';
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
    othersList.replaceChildren(...others.map((p) => renderOther(p)));
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

/* ---------- Render ---------- */

function renderProject(project, labels) {
  const meta = [
    metaRow('Stack', el('ul', { class: 'chips', role: 'list' }, project.stack.map((s) => el('li', { class: 'chip', text: s })))),
    project.architecture ? metaRow('Arquitectura', el('span', { text: project.architecture })) : null,
    metaRow('Categoría', el('span', { text: labels.get(project.category) ?? project.category })),
  ];

  const links = [
    project.repo ? externalLink(project.repo, 'Repositorio') : null,
    project.demo ? externalLink(project.demo, 'Ver demo') : null,
  ].filter(Boolean);

  const titleId = `project-${project.id}`;

  return el('article', { class: 'project', 'data-category': project.category, 'aria-labelledby': titleId }, [
    project.image ? renderFigure(project) : null,
    el('div', { class: 'project__main' }, [
      el('h3', { class: 'project__title', id: titleId, text: project.title }),
      el('p', { class: 'project__subtitle', text: project.subtitle }),
      el('p', { class: 'project__desc', text: project.description }),
      project.highlights?.length
        ? el('ul', { class: 'project__highlights', role: 'list' }, project.highlights.map((h) => el('li', { text: h })))
        : null,
    ]),
    el('div', { class: 'project__meta' }, [
      project.flow?.length ? renderFlow(project) : null,
      el('dl', { class: 'project__facts' }, meta),
      links.length ? el('div', { class: 'project__links' }, links) : null,
    ]),
  ]);
}

/** Diagrama vertical de capas; un pulso lo recorre de arriba abajo (ver motion/flow.js). */
function renderFlow(project) {
  const last = project.flow.length - 1;
  return el('div', { class: 'meta__row' }, [
    el('p', { class: 'meta__label', id: `flow-${project.id}`, text: project.flowLabel ?? 'Flujo' }),
    el('div', { class: 'flow', 'data-flow': true }, el('ol', { class: 'flow__list', 'aria-labelledby': `flow-${project.id}` },
      project.flow.map((step, i) => {
        const node = el('li', { class: i === 0 || i === last ? 'flow__node flow__node--edge' : 'flow__node', text: step });
        node.style.setProperty('--i', String(i));
        return node;
      }))),
  ]);
}

/** Captura del proyecto en WebP con dos tamaños (480w y 960w). */
function renderFigure(project) {
  const base = project.image;
  return el('figure', { class: 'project__figure' }, el('img', {
    src: `${base}-960.webp`,
    srcset: `${base}-480.webp 480w, ${base}-960.webp 960w`,
    sizes: '(min-width: 1200px) 1100px, 100vw',
    width: '960',
    height: '540',
    alt: `Captura de ${project.title}`,
    loading: 'lazy',
    decoding: 'async',
  }));
}

function renderOther(project) {
  const links = [
    project.repo ? externalLink(project.repo, 'Repositorio') : null,
    project.demo ? externalLink(project.demo, 'Demo') : null,
  ].filter(Boolean);

  return el('li', { class: 'other', 'data-category': project.category }, [
    el('span', { class: 'other__title', text: project.title }),
    el('span', { class: 'other__desc', text: project.subtitle }),
    el('span', { class: 'other__stack' }, [project.stack.join(' · '), ...links]),
  ]);
}

function metaRow(label, value) {
  return el('div', { class: 'meta__row' }, [
    el('dt', { class: 'meta__label', text: label }),
    el('dd', { class: 'meta__value' }, value),
  ]);
}

function externalLink(href, label) {
  return el('a', { class: 'btn btn--ghost btn--sm', href, target: '_blank', rel: 'noopener noreferrer' }, [
    label,
    icon('arrow-up-right', 'icon--nudge-out'),
    el('span', { class: 'visually-hidden', text: '(abre en una pestaña nueva)' }),
  ]);
}

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
export function moveIndicator(container) {
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

/* ---------- Filtro con transición ---------- */

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
    animateIn(rows, 10, 420);
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
