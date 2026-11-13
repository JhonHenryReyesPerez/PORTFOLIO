import { prefersReducedMotion } from '../dom.js';

/**
 * Chat con el asistente: ventana no modal, historial en la sesión y
 * mensajes de error claros (con el correo de Jhon como alternativa).
 */
const HISTORY_KEY = 'assistant-history';
const MAX_SENT = 12; // mensajes del historial que viajan a la API
const MAX_STORED = 30;
const WAKE_NOTICE_AFTER = 5000;
const REQUEST_TIMEOUT = 75000;
const CLOSE_DURATION = 160;

const STATUS = {
  idle: 'Pregúntame por su perfil, stack y proyectos',
  thinking: 'Escribiendo…',
  waking: 'Despertando el servidor… la primera vez puede tardar hasta un minuto',
};

const LINK_PATTERN = /(https?:\/\/[^\s<>"')]+[^\s<>"').,;:!?])|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

export function createChat(root, endpoint) {
  const ui = {
    toggle: root.querySelector('[data-assistant-toggle]'),
    toggleLabel: root.querySelector('[data-assistant-toggle-label]'),
    panel: root.querySelector('[data-assistant-panel]'),
    close: root.querySelector('[data-assistant-close]'),
    log: root.querySelector('[data-assistant-log]'),
    status: root.querySelector('[data-assistant-status]'),
    avatar: root.querySelector('[data-assistant-avatar]'),
    suggestions: root.querySelector('[data-assistant-suggestions]'),
    form: root.querySelector('[data-assistant-form]'),
    input: root.querySelector('[data-assistant-input]'),
    send: root.querySelector('[data-assistant-send]'),
  };

  const history = loadHistory();
  let pending = false;
  let closeTimer;

  history.forEach((message) => appendMessage(ui.log, message.role, message.content));
  if (history.length) ui.suggestions.hidden = true;

  const isOpen = () => root.classList.contains('is-open');

  function open() {
    window.clearTimeout(closeTimer);
    ui.panel.hidden = false;
    requestAnimationFrame(() => root.classList.add('is-open'));
    ui.toggle.setAttribute('aria-expanded', 'true');
    ui.toggleLabel.textContent = 'Cerrar el asistente Zeus';
    scrollToEnd(ui.log, false);
    ui.input.focus({ preventScroll: true });
  }

  function close({ returnFocus = true } = {}) {
    root.classList.remove('is-open');
    ui.toggle.setAttribute('aria-expanded', 'false');
    ui.toggleLabel.textContent = 'Abrir el asistente Zeus';
    closeTimer = window.setTimeout(() => { ui.panel.hidden = true; }, prefersReducedMotion() ? 0 : CLOSE_DURATION);
    if (returnFocus) ui.toggle.focus();
  }

  async function ask(question) {
    const text = question.trim();
    if (!text || pending) return;

    pending = true;
    ui.send.disabled = true;
    ui.suggestions.hidden = true;
    ui.input.value = '';

    history.push({ role: 'user', content: text });
    appendMessage(ui.log, 'user', text);
    const typing = appendTyping(ui.log);
    setStatus('thinking');
    const wakeTimer = window.setTimeout(() => setStatus('waking'), WAKE_NOTICE_AFTER);

    try {
      const reply = await requestReply(endpoint, history.slice(-MAX_SENT));
      history.push({ role: 'assistant', content: reply });
      appendMessage(ui.log, 'assistant', reply);
    } catch (error) {
      history.pop(); // la pregunta fallida no se reenvía como contexto
      appendMessage(ui.log, 'error', error.message);
    } finally {
      window.clearTimeout(wakeTimer);
      typing.remove();
      setStatus('idle');
      saveHistory(history);
      pending = false;
      ui.send.disabled = false;
      scrollToEnd(ui.log, true);
    }
  }

  function setStatus(state) {
    ui.status.textContent = STATUS[state];
    ui.avatar.classList.toggle('is-thinking', state !== 'idle');
  }

  ui.close.addEventListener('click', () => close());

  // Esc cierra la ventana si el foco está en el asistente o quedó suelto en la página
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    const focus = document.activeElement;
    if (root.contains(focus) || focus === document.body || !focus) close();
  });

  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(ui.input.value);
  });

  // Enter envía; Shift+Enter hace un salto de línea
  ui.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      ui.form.requestSubmit();
    }
  });

  ui.suggestions.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    // Las sugerencias se ocultan al preguntar: el foco pasa al campo para no perderse
    ui.input.focus({ preventScroll: true });
    ask(button.textContent);
  });

  return {
    toggle: () => (isOpen() ? close() : open()),
  };
}

async function requestReply(endpoint, messages) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  let response;

  try {
    response = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
  } catch {
    throw new Error(`No pude conectar con el asistente. Revisa tu conexión o escríbele a Jhon a ${contactEmail()}.`);
  } finally {
    window.clearTimeout(timeout);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || `El asistente no pudo responder. Puedes escribirle a Jhon a ${contactEmail()}.`);
  }
  if (!data?.reply) {
    throw new Error('El asistente devolvió una respuesta vacía. Intenta de nuevo.');
  }
  return data.reply;
}

/** Correo de contacto tomado de la página (lo actualiza contact.js desde profile.json). */
function contactEmail() {
  const link = document.querySelector('[data-profile-email-link]');
  return link?.getAttribute('href')?.replace(/^mailto:/, '') || 'su correo';
}

/** Agrega un mensaje como texto; las URLs y correos se convierten en enlaces seguros. */
function appendMessage(log, role, text) {
  const item = document.createElement('li');
  const kind = role === 'user' ? 'user' : role === 'error' ? 'error' : 'bot';
  item.className = `msg msg--${kind}`;
  if (role === 'user') {
    item.textContent = text;
  } else {
    item.append(...linkify(text));
  }
  log.append(item);
  scrollToEnd(log, true);
  return item;
}

function appendTyping(log) {
  const item = document.createElement('li');
  item.className = 'msg msg--bot msg--typing';
  item.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i += 1) item.append(document.createElement('span'));
  log.append(item);
  scrollToEnd(log, true);
  return item;
}

function linkify(text) {
  const nodes = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    if (match.index > last) nodes.push(document.createTextNode(text.slice(last, match.index)));
    const [value, url, email] = match;
    const link = document.createElement('a');
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.href = `mailto:${email}`;
    }
    link.textContent = value;
    nodes.push(link);
    last = match.index + value.length;
  }
  if (last < text.length) nodes.push(document.createTextNode(text.slice(last)));
  return nodes;
}

function scrollToEnd(log, smooth) {
  log.scrollTo({ top: log.scrollHeight, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
}

function loadHistory() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_STORED)));
  } catch {
    // Sin almacenamiento: la conversación solo vive en esta página
  }
}
