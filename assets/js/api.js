/**
 * Peticiones locales a los archivos JSON de /data.
 * Cada archivo se pide una sola vez; las llamadas siguientes reutilizan la promesa.
 */
const cache = new Map();

/**
 * Pide un JSON local y devuelve los datos junto con el estado HTTP y el tiempo de respuesta.
 * @param {string} path Ruta relativa, por ejemplo "data/projects.json".
 * @returns {Promise<{ data: unknown, status: number, statusText: string, ms: number }>}
 */
export function request(path) {
  if (!cache.has(path)) {
    const pending = load(path).catch((error) => {
      cache.delete(path); // Permite reintentar si falló
      throw error;
    });
    cache.set(path, pending);
  }
  return cache.get(path);
}

async function load(path) {
  const start = performance.now();
  const response = await fetch(path, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al cargar ${path}`);
  }

  const data = await response.json();
  return {
    data,
    status: response.status,
    statusText: response.statusText || 'OK',
    ms: Math.round(performance.now() - start),
  };
}

export const getProfile = () => request('data/profile.json').then((r) => r.data);
export const getSkills = () => request('data/skills.json').then((r) => r.data);
export const getProjects = () => request('data/projects.json').then((r) => r.data);
