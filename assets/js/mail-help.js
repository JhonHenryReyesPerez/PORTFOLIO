import { prefersReducedMotion } from './dom.js';

/**
 * Plan B para los enlaces mailto:.
 * Si el dispositivo no tiene una aplicación de correo configurada, el navegador
 * no hace nada al abrir un mailto:. Si tras un momento la página sigue en primer
 * plano (no se abrió ninguna aplicación), se ofrecen Gmail, Outlook y copiar el correo,
 * con el asunto y el mensaje ya escritos cuando vienen del formulario.
 */
const WAIT = 1500;
const CLOSE_DURATION = 180;

let ui;
let pending;
let closeTimer;
let returnFocus;

export function initMailHelp({ onCopy }) {
  const root = document.querySelector('[data-mail-help]');
  if (!root) return;

  ui = {
    root,
    gmail: root.querySelector('[data-mail-help-gmail]'),
    outlook: root.querySelector('[data-mail-help-outlook]'),
    copy: root.querySelector('[data-mail-help-copy]'),
    close: root.querySelector('[data-mail-help-close]'),
  };

  // Cualquier enlace mailto: de la página (también los que escribe el asistente)
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="mailto:"]');
    if (link && !event.defaultPrevented) watchMailOpen(parseMailto(link.getAttribute('href')), link);
  });

  ui.close.addEventListener('click', () => close());
  ui.copy.addEventListener('click', () => {
    onCopy();
    close();
  });
  for (const link of [ui.gmail, ui.outlook]) link.addEventListener('click', () => close({ restoreFocus: false }));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !ui.root.hidden) close();
  });
}

/** Abre un mailto: y, si no aparece ninguna aplicación de correo, muestra el plan B. */
export function openMail(message, trigger) {
  window.location.href = buildMailto(message);
  watchMailOpen(message, trigger);
}

function watchMailOpen(message, trigger) {
  if (!ui) return;
  pending?.cancel();

  let left = false;
  const markLeft = () => { left = true; };
  const onVisibility = () => { if (document.hidden) markLeft(); };
  window.addEventListener('blur', markLeft);
  window.addEventListener('pagehide', markLeft);
  document.addEventListener('visibilitychange', onVisibility);

  const cleanup = () => {
    window.removeEventListener('blur', markLeft);
    window.removeEventListener('pagehide', markLeft);
    document.removeEventListener('visibilitychange', onVisibility);
  };
  const timer = window.setTimeout(() => {
    cleanup();
    pending = null;
    if (!left && !document.hidden) show(message, trigger);
  }, WAIT);

  pending = { cancel: () => { window.clearTimeout(timer); cleanup(); } };
}

function show(message, trigger) {
  const { to, subject = '', body = '' } = message;
  ui.gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`
    + `&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  ui.outlook.href = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}`
    + `&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
  document.querySelector('[data-toast]')?.classList.remove('is-visible'); // ocuparía el mismo lugar
  window.clearTimeout(closeTimer);
  ui.root.hidden = false;
  requestAnimationFrame(() => ui.root.classList.add('is-open'));
  ui.gmail.focus({ preventScroll: true });
}

function close({ restoreFocus = true } = {}) {
  if (ui.root.hidden) return;
  ui.root.classList.remove('is-open');
  closeTimer = window.setTimeout(() => { ui.root.hidden = true; }, prefersReducedMotion() ? 0 : CLOSE_DURATION);
  if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}

function buildMailto({ to, subject = '', body = '' }) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`;
}

function parseMailto(href) {
  const [address, query = ''] = href.replace(/^mailto:/i, '').split('?');
  const params = new URLSearchParams(query);
  return {
    to: decodeURIComponent(address),
    subject: params.get('subject') ?? '',
    body: params.get('body') ?? '',
  };
}
