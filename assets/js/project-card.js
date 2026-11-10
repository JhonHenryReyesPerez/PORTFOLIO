import { el, icon } from './dom.js';

/**
 * Render de cada proyecto: texto a un lado y un panel visual a color al otro.
 * El panel depende de project.visual.type:
 *   - flow:    capas por las que pasa una petición, con un pulso que las recorre
 *   - modules: módulos del sistema y sus capas (MVC)
 *   - schema:  tablas de la base de datos y sus reglas
 *   - image:   captura real de la aplicación dentro de un marco de navegador
 */
export function renderProject(project, labels) {
  const titleId = `project-${project.id}`;
  const links = [
    project.repo ? externalLink(project.repo, 'Repositorio', 'github', true) : null,
    project.demo ? externalLink(project.demo, 'Ver demo', 'arrow-up-right', false) : null,
  ].filter(Boolean);

  const facts = [
    labels.get(project.category) ?? project.category,
    project.architecture ? `Arquitectura ${project.architecture}` : null,
  ].filter(Boolean);

  return el('article', {
    class: `project tint--${project.tint ?? 'accent'}`,
    'data-category': project.category,
    'aria-labelledby': titleId,
  }, [
    el('div', { class: 'project__body' }, [
      el('p', { class: 'project__facts', text: facts.join(' · ') }),
      el('h3', { class: 'project__title', id: titleId, text: project.title }),
      el('p', { class: 'project__subtitle', text: project.subtitle }),
      el('p', { class: 'project__desc', text: project.description }),
      project.highlights?.length
        ? el('ul', { class: 'project__highlights', role: 'list' }, project.highlights.map((h) => el('li', { text: h })))
        : null,
      el('ul', { class: 'chips project__stack', role: 'list', 'aria-label': 'Tecnologías' },
        project.stack.map((s) => el('li', { class: 'chip', text: s }))),
      links.length ? el('div', { class: 'project__links' }, links) : null,
    ]),
    project.visual ? renderVisual(project) : null,
  ]);
}

export function renderOther(project) {
  const links = [
    project.repo ? externalLink(project.repo, 'Repositorio', 'github', false, 'sm') : null,
    project.demo ? externalLink(project.demo, 'Demo', 'arrow-up-right', false, 'sm') : null,
  ].filter(Boolean);

  return el('li', { class: 'other', 'data-category': project.category }, [
    el('div', { class: 'other__main' }, [
      el('span', { class: 'other__title', text: project.title }),
      el('span', { class: 'other__desc', text: project.subtitle }),
    ]),
    el('span', { class: 'other__stack', text: project.stack.join(' · ') }),
    links.length ? el('div', { class: 'other__links' }, links) : null,
  ]);
}

/* ---------- Paneles visuales ---------- */

function renderVisual(project) {
  const { visual } = project;
  const labelId = `visual-${project.id}`;
  const builders = { flow: flowVisual, modules: modulesVisual, schema: schemaVisual, image: imageVisual };
  const content = builders[visual.type]?.(visual, labelId, project);
  if (!content) return null;

  return el('div', { class: `project__visual visual--${visual.type}` }, [
    visual.label ? el('p', { class: 'visual__label', id: labelId, text: visual.label }) : null,
    content,
  ]);
}

function flowVisual(visual, labelId) {
  const last = visual.steps.length - 1;
  return el('div', { class: 'flow', 'data-flow': true }, el('ol', { class: 'flow__list', 'aria-labelledby': labelId },
    visual.steps.map((step, i) => indexed(el('li', {
      class: i === 0 || i === last ? 'flow__node flow__node--edge' : 'flow__node',
      text: step,
    }), i))));
}

function modulesVisual(visual, labelId) {
  return el('div', { class: 'modules', 'data-flow': true }, [
    el('ul', { class: 'modules__grid', role: 'list', 'aria-labelledby': labelId },
      visual.items.map((item, i) => indexed(el('li', { class: 'modules__item' }, [
        el('span', { class: 'modules__dot', 'aria-hidden': 'true' }),
        item,
      ]), i))),
    el('ol', { class: 'chain', 'aria-label': 'Capas de la arquitectura MVC' },
      visual.layers.map((layer, i) => indexed(el('li', { class: 'chain__item', text: layer }), i))),
  ]);
}

function schemaVisual(visual, labelId) {
  return el('div', { class: 'schema', 'data-flow': true }, [
    el('ul', { class: 'schema__tables', role: 'list', 'aria-labelledby': labelId },
      visual.tables.map((table, i) => indexed(el('li', { class: 'schema__table' }, [
        icon('table', 'schema__icon'),
        el('span', { text: table }),
      ]), i))),
    el('ul', { class: 'schema__badges', role: 'list' },
      visual.badges.map((badge) => el('li', { class: 'schema__badge' }, [
        el('span', { class: 'live-dot', 'aria-hidden': 'true' }),
        badge,
      ]))),
  ]);
}

function imageVisual(visual, _labelId, project) {
  const host = project.demo ? new URL(project.demo).host : '';
  return el('figure', { class: 'browser' }, [
    el('div', { class: 'browser__bar', 'aria-hidden': 'true' }, [
      el('span', { class: 'browser__dots' }, [el('i'), el('i'), el('i')]),
      el('span', { class: 'browser__url', text: host }),
    ]),
    el('div', { class: 'browser__view' }, el('img', {
      src: `${visual.src}-960.webp`,
      srcset: `${visual.src}-480.webp 480w, ${visual.src}-960.webp 960w`,
      sizes: '(min-width: 1024px) 34rem, 92vw',
      width: '960',
      height: '600',
      alt: visual.alt,
      loading: 'lazy',
      decoding: 'async',
    })),
  ]);
}

/* ---------- Utilidades ---------- */

function indexed(node, i) {
  node.style.setProperty('--i', String(i));
  return node;
}

function externalLink(href, label, iconId, primary, size) {
  const classes = ['btn', primary ? 'btn--tint' : 'btn--ghost', size === 'sm' ? 'btn--xs' : 'btn--sm'];
  return el('a', { class: classes.join(' '), href, target: '_blank', rel: 'noopener noreferrer' }, [
    iconId === 'github' ? icon('github') : null,
    label,
    iconId !== 'github' ? icon(iconId, 'icon--nudge-out') : null,
    el('span', { class: 'visually-hidden', text: '(abre en una pestaña nueva)' }),
  ]);
}
