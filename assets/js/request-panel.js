import { request } from './api.js';
import { el } from './dom.js';

/**
 * Panel del hero: muestra la petición real a data/profile.json,
 * con su estado HTTP, el tiempo de respuesta y un extracto del JSON recibido.
 */
const PATH = 'data/profile.json';
const FIELDS = ['name', 'role', 'focus', 'status', 'stack'];

export async function initRequestPanel() {
  const status = document.querySelector('[data-request-status]');
  const body = document.querySelector('[data-request-body]');
  if (!status || !body) return;

  try {
    const { data, status: code, statusText, ms } = await request(PATH);
    const excerpt = Object.fromEntries(FIELDS.filter((k) => k in data).map((k) => [k, data[k]]));

    status.textContent = `${code} ${statusText} · ${ms} ms`;
    status.classList.add('is-ok');
    body.replaceChildren(renderJson(excerpt));
  } catch (error) {
    status.textContent = 'error';
    status.classList.add('is-error');
    body.replaceChildren(
      el('code', {}, el('span', { class: 'code-muted', text: `// ${error.message}` })),
    );
  }
}

/** Convierte un objeto plano en líneas de JSON con resaltado de sintaxis. */
function renderJson(obj) {
  const lines = [];
  const entries = Object.entries(obj);

  lines.push([punct('{')]);
  entries.forEach(([key, value], index) => {
    const comma = index < entries.length - 1 ? [punct(',')] : [];
    lines.push(['  ', span('code-key', `"${key}"`), punct(': '), ...renderValue(value), ...comma]);
  });
  lines.push([punct('}')]);

  return el(
    'code',
    {},
    lines.map((parts, i) => {
      const line = el('span', { class: 'json-line' }, parts);
      line.style.setProperty('--i', String(i));
      return line;
    }),
  );
}

function renderValue(value) {
  if (Array.isArray(value)) {
    const parts = [punct('[')];
    value.forEach((item, i) => {
      parts.push(...renderValue(item));
      if (i < value.length - 1) parts.push(punct(', '));
    });
    parts.push(punct(']'));
    return parts;
  }
  if (typeof value === 'string') return [span('code-string', `"${value}"`)];
  if (typeof value === 'number' || typeof value === 'boolean') return [span('code-number', String(value))];
  if (value === null) return [span('code-number', 'null')];
  return [span('code-muted', '{…}')];
}

const span = (cls, text) => el('span', { class: cls, text });
const punct = (text) => span('code-punct', text);
