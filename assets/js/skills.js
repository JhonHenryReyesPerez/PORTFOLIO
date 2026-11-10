import { getSkills } from './api.js';
import { el, errorNote } from './dom.js';

/** Pinta el stack tecnológico desde skills.json, agrupado por categoría. */
export async function initSkills() {
  const container = document.querySelector('[data-skills]');
  if (!container) return;

  try {
    const groups = await getSkills();
    container.replaceChildren(...groups.map((group) =>
      el('div', { class: 'stack__group' }, [
        el('h3', { class: 'stack__label', text: group.label }),
        el('ul', { class: 'chips', role: 'list' }, group.items.map((item) =>
          el('li', { class: item.primary ? 'chip chip--primary' : 'chip' }, [
            item.name,
            item.primary ? el('span', { class: 'visually-hidden', text: ' (principal)' }) : null,
          ]))),
      ])));
  } catch (error) {
    container.replaceChildren(errorNote('No se pudo cargar el stack tecnológico.', error));
  } finally {
    container.removeAttribute('aria-busy');
  }
}
