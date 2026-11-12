import { getSkills } from './api.js';
import { el, errorNote } from './dom.js';

/**
 * Pinta el stack tecnológico desde skills.json, agrupado por categoría,
 * con el logo de cada tecnología (sprite local assets/icons/tech.svg).
 */
const SPRITE = 'assets/icons/tech.svg';

export async function initSkills() {
  const container = document.querySelector('[data-skills]');
  if (!container) return;

  try {
    const groups = await getSkills();
    container.replaceChildren(...groups.map((group) =>
      el('div', { class: 'stack__group' }, [
        el('h3', { class: 'stack__label', text: group.label }),
        el('ul', { class: 'techs', role: 'list' }, group.items.map(renderTech)),
      ])));
  } catch (error) {
    container.replaceChildren(errorNote('No se pudo cargar el stack tecnológico.', error));
  } finally {
    container.removeAttribute('aria-busy');
  }
}

function renderTech(item) {
  return el('li', { class: item.primary ? 'tech tech--primary' : 'tech' }, [
    item.icon ? logo(item.icon) : null,
    item.note
      ? el('span', { class: 'tech__name' }, [item.name, el('small', { class: 'tech__note', text: item.note })])
      : el('span', { class: 'tech__name', text: item.name }),
    item.primary ? el('span', { class: 'tech__badge', text: 'Principal' }) : null,
  ]);
}

function logo(id) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'tech__logo');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', `${SPRITE}#${id}`);
  svg.append(use);
  return svg;
}
