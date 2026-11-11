import { prefersReducedMotion } from './dom.js';

/**
 * Tema claro/oscuro. Respeta la preferencia del sistema hasta que el usuario elige;
 * la elección se guarda en localStorage (si está disponible).
 */
const KEY = 'theme';
const system = window.matchMedia('(prefers-color-scheme: dark)');

export function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  syncButton(button);
  system.addEventListener('change', () => {
    if (!readStored()) syncButton(button);
  });

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      store(next);
      syncButton(button);
    };

    // Fundido cruzado entre temas cuando el navegador lo soporta
    if (document.startViewTransition && !prefersReducedMotion()) document.startViewTransition(apply);
    else apply();
  });
}

function currentTheme() {
  return document.documentElement.dataset.theme ?? (system.matches ? 'dark' : 'light');
}

function syncButton(button) {
  const dark = currentTheme() === 'dark';
  const label = button.querySelector('[data-theme-label]');
  if (label) label.textContent = dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', dark ? '#101216' : '#e6e9f0');
  });
}

function readStored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function store(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Sin almacenamiento (modo privado): el tema solo dura esta visita
  }
}
