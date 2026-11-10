import { request } from './api.js';
import { el, prefersReducedMotion } from './dom.js';

/**
 * Panel del hero: muestra la petición real a data/profile.json,
 * con su estado HTTP, el tiempo de respuesta y un extracto del JSON recibido.
 * El botón de reenviar hace una petición nueva (sin caché) y vuelve a pintar la respuesta.
 */
const PATH = 'data/profile.json';
const FIELDS = ['name', 'role', 'focus', 'status', 'stack'];

export function initRequestPanel() {
  const status = document.querySelector('[data-request-status]');
  const body = document.querySelector('[data-request-body]');
  const resend = document.querySelector('[data-request-resend]');
  if (!status || !body) return;

  const send = async (fresh) => {
    if (resend) resend.disabled = true;
    status.classList.remove('is-ok', 'is-error');
    status.textContent = 'enviando…';

    try {
      const { data, status: code, statusText, ms } = await request(PATH, { fresh });
      const excerpt = Object.fromEntries(FIELDS.filter((k) => k in data).map((k) => [k, data[k]]));
      status.textContent = `${code} ${statusText} · ${ms} ms`;
      status.classList.add('is-ok');
      body.replaceChildren(renderJson(excerpt));
    } catch (error) {
      status.textContent = 'error';
      status.classList.add('is-error');
      body.replaceChildren(el('code', {}, el('span', { class: 'code-muted', text: `// ${error.message}` })));
    } finally {
      if (resend) resend.disabled = false;
    }
  };

  resend?.addEventListener('click', () => {
    // Giro del icono como respuesta inmediata al clic (una vuelta, sin volver atrás)
    if (!prefersReducedMotion()) {
      resend.querySelector('.icon')?.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        { duration: 600, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      );
    }
    send(true);
  });

  send(false);
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
