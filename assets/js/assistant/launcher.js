/**
 * Botón del asistente (la nutria). Es lo único que se carga con la página:
 * el chat (chat.js) se importa al pasar el puntero, enfocar o abrir el botón.
 * Si no hay una API configurada, el asistente no aparece y el sitio sigue igual.
 */
const LOCAL_ENDPOINT = 'http://localhost:8080';
const HINT_KEY = 'assistant-hint-seen';
const HINT_DELAY = 3500;
const HINT_DURATION = 7000;

export function initAssistant() {
  const root = document.querySelector('[data-assistant]');
  const endpoint = resolveEndpoint();
  if (!root || !endpoint) return;

  const toggle = root.querySelector('[data-assistant-toggle]');
  root.classList.add('is-ready');
  root.hidden = false;
  document.documentElement.classList.add('has-assistant');

  let chat;
  const loadChat = () => {
    chat ??= import('./chat.js').then((module) => module.createChat(root, endpoint));
    return chat;
  };

  // Al primer acercamiento se "despierta" el servidor (en el plan gratuito se duerme)
  // y se descarga el chat, así al abrirlo ya está listo.
  let warmed = false;
  const warmUp = () => {
    if (warmed) return;
    warmed = true;
    fetch(`${endpoint}/api/health`).catch(() => {});
    loadChat();
  };

  toggle.addEventListener('pointerenter', warmUp, { once: true });
  toggle.addEventListener('focus', warmUp, { once: true });
  toggle.addEventListener('click', async () => {
    warmUp();
    hideHint(root);
    (await loadChat()).toggle();
  });

  showHintOnce(root);
}

/** En local se usa la API de desarrollo; en producción, la URL del meta "assistant-endpoint". */
function resolveEndpoint() {
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return LOCAL_ENDPOINT;
  const meta = document.querySelector('meta[name="assistant-endpoint"]');
  return meta?.content.trim().replace(/\/+$/, '') || '';
}

/** Un globo de ayuda, una sola vez por visita. */
function showHintOnce(root) {
  try {
    if (sessionStorage.getItem(HINT_KEY)) return;
    sessionStorage.setItem(HINT_KEY, '1');
  } catch {
    // Sin almacenamiento disponible: se muestra igual
  }
  window.setTimeout(() => {
    if (root.classList.contains('is-open')) return;
    root.classList.add('has-hint');
    window.setTimeout(() => hideHint(root), HINT_DURATION);
  }, HINT_DELAY);
}

function hideHint(root) {
  root.classList.remove('has-hint');
}
