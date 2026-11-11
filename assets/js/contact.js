import { getProfile } from './api.js';
import { showToast } from './toast.js';

/**
 * Contacto: enlaza el correo y las redes desde profile.json, copia el correo
 * al portapapeles y convierte el formulario en un mensaje mailto: listo para enviar.
 */
let email = '';

export async function initContact() {
  const form = document.querySelector('[data-contact-form]');
  const copyButton = document.querySelector('[data-copy-email]');

  // Valor de respaldo: el que ya está en el HTML
  email = document.querySelector('[data-profile-email-text]')?.textContent.trim() ?? '';

  try {
    const profile = await getProfile();
    applyProfile(profile.contact ?? {});
  } catch {
    // Si profile.json falla, el HTML ya trae el correo; no hace falta avisar
  }

  copyButton?.addEventListener('click', copyEmail);
  form?.addEventListener('submit', (event) => handleSubmit(event, form));
  form?.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid') === 'true') validateField(event.target);
  });
}

function applyProfile(contact) {
  if (contact.email) {
    email = contact.email;
    for (const link of document.querySelectorAll('[data-profile-email-link]')) {
      link.href = `mailto:${email}`;
    }
    for (const node of document.querySelectorAll('[data-profile-email-text]')) {
      node.textContent = email;
    }
  }

  for (const link of document.querySelectorAll('[data-profile-link]')) {
    const url = contact[link.dataset.profileLink];
    if (url) {
      link.href = url;
      link.hidden = false;
    }
  }
}

let copiedTimer;

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email);
    showToast('Correo copiado al portapapeles');
    swapCopyIcon(true);
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => swapCopyIcon(false), 1800);
  } catch {
    showToast(`No se pudo copiar. Mi correo es ${email}`, 4000);
  }
}

/** Cruza el icono de copiar con un check mientras dura la confirmación. */
function swapCopyIcon(copied) {
  document.querySelector('[data-copy-icon]')?.classList.toggle('is-hidden', copied);
  document.querySelector('[data-check-icon]')?.classList.toggle('is-hidden', !copied);
}

/* ---------- Formulario → mailto ---------- */

const MESSAGES = {
  name: { valueMissing: 'Escribe tu nombre.', tooShort: 'El nombre necesita al menos 2 caracteres.' },
  subject: { valueMissing: 'Escribe un asunto.', tooShort: 'El asunto necesita al menos 3 caracteres.' },
  message: { valueMissing: 'Escribe tu mensaje.', tooShort: 'El mensaje necesita al menos 10 caracteres.' },
};

function validateField(field) {
  field.value = field.value.replace(/^\s+/, '');
  const { validity } = field;
  const texts = MESSAGES[field.name] ?? {};
  let message = '';

  if (validity.valueMissing) message = texts.valueMissing;
  else if (validity.tooShort) message = texts.tooShort;
  else if (!validity.valid) message = 'Revisa este campo.';

  field.setAttribute('aria-invalid', String(Boolean(message)));
  const error = document.querySelector(`[data-error-for="${field.name}"]`);
  if (error) error.textContent = message;
  return !message;
}

function handleSubmit(event, form) {
  event.preventDefault();

  const fields = [...form.querySelectorAll('input, textarea')];
  const results = fields.map(validateField);
  const firstInvalid = fields[results.indexOf(false)];
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const data = new FormData(form);
  const subject = String(data.get('subject')).trim();
  const body = `${String(data.get('message')).trim()}\n\n${String(data.get('name')).trim()}`;

  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showToast('Abriendo tu aplicación de correo…');
}
