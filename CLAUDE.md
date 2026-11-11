# CLAUDE.md — Portafolio profesional de Jhon Reyes

Este archivo guía a Claude Code en el desarrollo del portafolio. Léelo completo antes de hacer cambios.

## 1. Contexto del proyecto

- **Qué es:** portafolio web profesional, entrega final del entrenamiento. El departamento de empleabilidad lo mostrará a reclutadores, así que debe verse pulido, cargar rápido y tener un historial de Git limpio.
- **Dueño:** Jhon Reyes — Desarrollador de Software | Java · Spring Boot · PostgreSQL (perfil backend).
- **Idioma del sitio:** español (`<html lang="es">`). Código, nombres de archivos y commits en inglés.
- **Tono del contenido:** profesional, directo, sin exagerar. No inventes logros, métricas ni tecnologías que no estén en este archivo.

## 2. Rúbrica de evaluación (prioridad absoluta)

Todo cambio debe sumar a alguno de estos criterios. Los que valen puntos:

| Criterio | Puntos | Cómo se cumple en este proyecto |
|---|---|---|
| Responsive | 2 | Mobile-first, sin scroll horizontal de 320px a 1920px (ver §6) |
| Manejo de contrastes (colores) | 2 | Paleta con tokens CSS, contraste WCAG AA mínimo, modo claro/oscuro (ver §7) |
| Imágenes optimizadas | 2 | WebP/AVIF, `srcset`, `loading="lazy"`, `width`/`height` explícitos (ver §8) |
| Diagramación (estructura semántica) | 2 | Landmarks HTML5, jerarquía de headings correcta (ver §5) |
| Navegabilidad | 2 | Navbar fija, anclas, menú móvil, skip link, foco visible (ver §9) |
| Despliegue en GitHub Pages | 2 | Workflow de GitHub Actions desde `main` (ver §12) |
| Peticiones locales para carga dinámica | 2 | Proyectos y skills se cargan con `fetch()` desde JSON locales (ver §10) |
| Diseño frontend (animaciones, transiciones) | 2 | Animaciones al hacer scroll, hover, transiciones; respeta `prefers-reduced-motion` (ver §11) |
| Testing de usabilidad | 2 | Lighthouse, checklist manual, pruebas automatizadas (ver §13) |
| Web components | 0 | Opcional; no priorizar |
| Manejo de comportamientos y eventos | 0 | Se cubre de forma natural con el JS del sitio |

Requisitos adicionales del enunciado (obligatorios aunque no tengan puntaje explícito):

- Publicación en repositorio con **Git Flow** y **Conventional Commits** (§4).
- **README** completo en GitHub (§14).
- **Redirección a correo electrónico** (enlace `mailto:` + formulario que abre el cliente de correo) (§10.3).
- **Despliegue de la app** funcionando sin errores en producción.
- **Plus: framework funcional** (§15).

## 3. Stack y decisiones técnicas

- **HTML5 + CSS3 + JavaScript vanilla (ES Modules)**, sin build step. GitHub Pages lo sirve tal cual.
- **Sin frameworks CSS** en el sitio principal: CSS propio con custom properties, Flexbox y Grid. Esto demuestra dominio de fundamentos.
- **Datos dinámicos en JSON local** (`/data/*.json`) consumidos con `fetch()`.
- **Fuentes:** `IBM Plex Sans` (texto y títulos) e `IBM Plex Mono` (solo para código y datos, nunca como adorno), desde Google Fonts con `display=swap` y `preconnect`.
- **Iconos:** SVG inline o un sprite SVG local. Nada de librerías pesadas de iconos.
- **Sin dependencias en runtime** salvo que se justifique. Las herramientas de desarrollo (linters, tests) van en `package.json` como `devDependencies`.

## 4. Git Flow y Conventional Commits

### Ramas
- `main` → producción (lo que se despliega en GitHub Pages). Solo recibe merges desde `release/*` o `hotfix/*`.
- `develop` → integración. Base de todo trabajo nuevo.
- `feature/<nombre-corto>` → desde `develop`, vuelve a `develop`. Ej: `feature/projects-section`.
- `release/vX.Y.Z` → desde `develop`, se mergea a `main` y a `develop`, con tag `vX.Y.Z`.
- `hotfix/<nombre>` → desde `main`, se mergea a `main` y a `develop`.

Usa `--no-ff` en los merges para que el historial muestre las ramas. **Nunca** commitees directo a `main`.

### Commits
Formato: `<tipo>(<scope opcional>): <descripción en imperativo, minúscula, sin punto>`

Tipos: `feat`, `fix`, `style`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`, `build`.

Ejemplos:
```
feat(projects): load project cards from projects.json
style(hero): add fade-in animation on load
perf(images): convert project screenshots to webp
docs(readme): add deployment instructions
ci(pages): add github actions deploy workflow
```

Reglas:
- Commits pequeños y atómicos: un cambio lógico por commit.
- No mezclar formato/estilo con cambios de lógica.
- Solo commitear/pushear cuando el usuario lo pida.

## 5. Estructura de archivos

```
/
├── index.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── reset.css
│   │   ├── tokens.css        # variables: colores, tipografía, espaciado, sombras
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── effects.css
│   │   ├── projects.css
│   │   └── glass.css         # cristal del tema claro
│   ├── js/
│   │   ├── main.js           # punto de entrada (type="module")
│   │   ├── api.js            # fetch a /data con caché, estado HTTP y tiempo
│   │   ├── dom.js            # el(), icon(), errorNote(), prefersReducedMotion()
│   │   ├── request-panel.js  # panel del hero (GET data/profile.json)
│   │   ├── skills.js         # stack desde skills.json
│   │   ├── projects.js       # proyectos, filtros y su coreografía
│   │   ├── nav.js            # menú móvil, scroll spy, cabecera, volver arriba
│   │   ├── theme.js          # modo claro/oscuro
│   │   ├── contact.js        # correo, redes, formulario → mailto
│   │   └── toast.js          # avisos breves
│   ├── img/
│   │   ├── profile/
│   │   └── projects/
│   ├── icons/
│   └── docs/                 # CV en PDF
├── data/
│   ├── profile.json
│   ├── skills.json
│   └── projects.json
├── tests/
├── .github/workflows/deploy.yml
├── README.md
└── CLAUDE.md
```

### Estructura semántica de `index.html`

```
<body>
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <header>            → logo/nombre + <nav aria-label="Principal">
  <main id="main">
    <section id="inicio" aria-labelledby="...">     → hero: nombre (único <h1>), rol, CTA
    <section id="sobre-mi">                          → <h2>Sobre mí</h2>
    <section id="stack">                             → <h2> + grupos con <h3>
    <section id="proyectos">                         → <h2> + filtros + <article> por proyecto (<h3>)
                                                       + <h3>Otros proyectos</h3> con lista
    <section id="contacto">                          → <h2> + formulario + enlaces
  </main>
  <footer>            → redes, copyright, volver arriba
</body>
```

Reglas:
- Un solo `<h1>`. Sin saltos de nivel en headings.
- Cada proyecto es un `<article>`; las listas de tecnologías son `<ul>`.
- Usa `<figure>`/`<figcaption>` para capturas, `<time>` para fechas, `<address>` para contacto si aplica.
- Nada de `<div>` donde exista un elemento semántico. Nada de `onclick` en `<div>`: usa `<button>` o `<a>`.
- Incluir `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:image`), favicon y `theme-color`.

## 6. Responsive

- **Mobile-first**: estilos base para móvil, `min-width` en media queries.
- Breakpoints: `480px`, `768px`, `1024px`, `1280px`.
- Contenedor máximo ~`1200px`, gutter lateral mínimo `16px` en móvil.
- Tipografía fluida con `clamp()`.
- Grid de proyectos: 1 columna (móvil) → 2 (tablet) → 3 (desktop) con `repeat(auto-fit, minmax(...))`.
- Áreas táctiles mínimas de `44×44px`.
- Verificar siempre en 320, 375, 768, 1024 y 1440 px. **Cero scroll horizontal.**

## 7. Colores y contraste

- Definir todos los colores como custom properties en `tokens.css` (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-accent`, `--color-border`).
- Paleta sugerida (tech/backend, sobria): fondo oscuro azul-grisáceo, texto casi blanco, primario en un azul o verde-azulado, acento cálido puntual. Ajustar si el usuario indica otra preferencia.
- **Contraste mínimo WCAG AA:** 4.5:1 en texto normal, 3:1 en texto grande e iconos/bordes de controles. Verificar cada combinación.
- Modo claro y oscuro: respeta `prefers-color-scheme` por defecto y permite cambiarlo con un botón; guardar la elección en `localStorage` (envuelto en `try/catch`).
- Nunca transmitir información solo con color.
- **Tema claro = cristal (iOS / Liquid Glass)** en `assets/css/glass.css`: campo de color fijo (`--page-mesh`), paneles con `--glass-*` y cabecera en cápsula al hacer scroll. Los tokens `--glass-*` valen `initial` en el tema oscuro, así que cada regla usa `var(--glass-x, <valor del oscuro>)` y el oscuro no cambia. `backdrop-filter` solo en cabecera, menú móvil, botón volver arriba y formulario de contacto (rendimiento). Respeta `prefers-reduced-transparency`.

## 8. Imágenes optimizadas

- Formato **WebP** (AVIF opcional con `<picture>` y fallback). Nada de PNG/JPG pesados en producción.
- Tamaño objetivo: < 150 KB por captura de proyecto, < 60 KB la foto de perfil.
- Usar `srcset` + `sizes` con al menos 2 tamaños (p. ej. 480w y 960w).
- Siempre `width` y `height` explícitos (evita CLS) y `alt` descriptivo (o `alt=""` si es decorativa).
- `loading="lazy"` y `decoding="async"` en todo lo que esté bajo el primer pantallazo; la imagen del hero **no** lleva lazy (usa `fetchpriority="high"`).
- Iconos y logos de tecnologías en SVG.
- Para convertir: `squoosh-cli`, `sharp` o `cwebp`. Documentar el proceso en el README.

## 9. Navegabilidad y accesibilidad

- Navbar fija (sticky) con enlaces a cada sección y `scroll-behavior: smooth` (desactivado con `prefers-reduced-motion`).
- `scroll-margin-top` en secciones para que la navbar no tape los títulos.
- **Scroll spy:** resaltar el enlace de la sección visible (`aria-current="true"`).
- Menú hamburguesa en móvil: `<button aria-expanded aria-controls>`, cierra con `Esc`, al hacer clic en un enlace y al hacer clic fuera.
- Skip link visible al recibir foco.
- Foco visible en todos los elementos interactivos (`:focus-visible`), nunca `outline: none` sin reemplazo.
- Todo navegable con teclado (Tab / Shift+Tab / Enter / Esc).
- Botón "volver arriba".
- Enlaces externos con `target="_blank" rel="noopener noreferrer"` e indicación visual/`aria-label`.
- Página `404.html` con enlace de regreso al inicio.

## 10. Carga dinámica (peticiones locales)

### 10.1 Archivos JSON
`data/projects.json` — esquema por proyecto:
```json
{
  "id": "campusdesk",
  "title": "CampusDesk",
  "subtitle": "Sistema de Gestión de Soporte Técnico",
  "description": "...",
  "highlights": ["Autenticación JWT", "Control de acceso por roles"],
  "stack": ["Java", "Spring Boot", "Spring Security", "PostgreSQL", "JavaScript"],
  "architecture": "Arquitectura por capas",
  "category": "backend",
  "featured": true,
  "image": "assets/img/projects/campusdesk",
  "repo": "https://github.com/...",
  "demo": null
}
```
`data/skills.json` agrupa por categoría (lenguajes, backend, frontend, bases de datos, herramientas). `data/profile.json` contiene nombre, rol, resumen y enlaces.

### 10.2 Reglas del JS
- `api.js` expone funciones `async` (`getProjects()`, `getSkills()`, `getProfile()`) con `try/catch` y verificación de `response.ok`.
- Mostrar **estado de carga** (skeleton) y **estado de error** con mensaje amigable.
- Renderizar con `document.createElement` / `<template>`; si se usa `innerHTML`, escapar el texto.
- **Filtros de proyectos** por categoría (Todos / Backend / Frontend / Bases de datos / Hackathon) con botones accesibles (`aria-pressed`).
- Nota: `fetch()` no funciona con `file://`. Para desarrollo local usar un servidor (`npx serve`, Live Server de VS Code o `python -m http.server`).

### 10.3 Contacto y redirección a correo
- Enlace directo `mailto:` visible en la sección de contacto y en el footer.
- Formulario (nombre, asunto, mensaje) con validación HTML5 + JS que, al enviar, construye un `mailto:` con `subject` y `body` codificados con `encodeURIComponent` y redirige con `window.location.href`.
- Botón para copiar el correo al portapapeles con feedback visual (toast).
- Enlaces a LinkedIn y GitHub, y botón para descargar el CV (PDF).
- **El correo, LinkedIn y GitHub se toman de `profile.json`.** Si aún no están, dejar placeholders claramente marcados (`TODO`) y pedírselos al usuario; no inventarlos.

## 11. Diseño frontend: animaciones y transiciones

Criterio: movimiento con propósito, no decoración. Detalle de cómo hacerlo en §18 (skills de Emil Kowalski).

- **Entrada del hero** coreografiada una sola vez al cargar (nombre → rol → CTA, escalonado corto). Usar la skill `choreograph`.
- **Micro-interacciones:** tarjetas de proyecto que suben ~2px con sombra en hover/focus, imagen con zoom 1.02–1.03 dentro de su marco, botones con respuesta en hover y al presionar, subrayados que se dibujan.
- **Carga dinámica animada:** cuando las tarjetas llegan desde `projects.json`, entran como **un grupo** coreografiado (stagger corto); al cambiar de filtro, transición de salida/entrada en lugar de un salto brusco.
- **Transiciones de estado:** navbar (transparente → sólida al hacer scroll), menú móvil, cambio de tema, toast de "correo copiado".
- **Evitar** (regla compartida por Taste y Emil): fade-in en cada sección o en cada tarjeta al hacer scroll, parallax en texto, scroll-jacking, tilt 3D, carruseles automáticos. Como máximo un *reveal* sutil por sección importante, nunca por elemento.
- Animar solo `transform` y `opacity` (rendimiento). Duraciones entre 150 ms y 400 ms para UI; easing tipo `ease-out` para entradas.
- **Presupuesto de efectos (lleno, no agregar más sin quitar otro)** — `assets/css/effects.css` + `assets/js/motion/`:
  - 1 efecto de puntero: spotlight con rejilla de puntos en el hero (`spotlight.js`).
  - Fondo: aurora del hero (3 luces de color, 24–32 s, se pausa con el botón de la cinta vía `.is-motion-paused` en `<html>`).
  - 2 momentos: cinta de tecnologías con pausa (`marquee.js`) y frase que se enciende al hacer scroll en Sobre mí (`word-highlight.js`).
  - Paneles visuales por proyecto (`project-card.js` + `projects.css`): 2 diagramas con pulsos (CampusDesk, SmartCity Fix), módulos MVC y esquema de BD que se iluminan en secuencia, todos 3 ciclos y reposo; captura de demo en marco de navegador. Cada proyecto tiene un tono (`tint` en `projects.json` → `--tint-*` en `tokens.css`).
  - Bloque de contacto (CTA) con degradado accent → accent-2 y brillo en el botón primario.
  - Micro-interacciones: indicador de filtros con `clip-path`, intercambio de iconos (tema, copiar), reenviar petición.
- **Obligatorio:** `@media (prefers-reduced-motion: reduce)` desactiva o reduce todas las animaciones.
- Las animaciones nunca deben ocultar contenido si el JS falla (el contenido es visible por defecto; la clase de animación se agrega desde JS).

## 12. Despliegue en GitHub Pages

- Workflow `.github/workflows/deploy.yml` con `actions/upload-pages-artifact` + `actions/deploy-pages`, disparado en push a `main`.
- Rutas **relativas** en todo el sitio (`assets/...`, `data/...`), nunca absolutas con `/`, porque el sitio vive en `https://<usuario>.github.io/<repo>/`.
- Archivo `.nojekyll` en la raíz.
- Tras cada despliegue: verificar que la URL pública cargue, que los JSON respondan 200 y que no haya errores en consola.

## 13. Testing de usabilidad

1. **Lighthouse** (móvil y desktop): objetivo ≥ 90 en Performance, Accessibility, Best Practices y SEO. Guardar capturas de los reportes en `docs/` o en el README.
2. **Validación:** HTML con W3C Validator, CSS con W3C CSS Validator, accesibilidad con axe DevTools o WAVE.
3. **Pruebas automatizadas** (devDependencies): Playwright para flujos clave:
   - La página carga y renderiza las tarjetas desde `projects.json`.
   - Los filtros muestran solo la categoría elegida.
   - El menú móvil abre/cierra y es operable con teclado.
   - El formulario de contacto valida campos y genera el `mailto:` correcto.
   - Sin scroll horizontal en 320px, 768px y 1440px.
4. **Checklist manual** en `tests/usability-checklist.md`: probar en Chrome, Firefox y Edge, y en un móvil real; navegación solo con teclado; zoom al 200%.
5. Documentar los resultados (qué se probó, resultado, qué se corrigió) en el README.

## 14. README.md

Debe incluir:
- Título, descripción breve y **enlace al sitio desplegado** al inicio.
- Captura o GIF del portafolio.
- Tecnologías usadas.
- Funcionalidades (responsive, tema claro/oscuro, carga dinámica, filtros, contacto por correo, animaciones).
- Estructura del proyecto.
- Cómo ejecutarlo localmente (servidor local requerido por `fetch`).
- Cómo se optimizaron las imágenes.
- Flujo de trabajo Git (Git Flow + Conventional Commits).
- Despliegue (GitHub Pages + Actions).
- Resultados de testing (Lighthouse, validadores, Playwright).
- Autor y enlaces de contacto.

## 15. Plus: framework funcional

Para sumar el plus sin complicar el sitio principal, la opción recomendada es coherente con el perfil backend:

- **Recomendado:** una API REST pequeña en **Spring Boot** (p. ej. `GET /api/projects` sirviendo los mismos datos, o un endpoint de contacto) desplegada en un servidor gratuito (Render / Railway) y documentada en el README. El frontend usa los JSON locales y, opcionalmente, puede consumir la API como fuente alternativa.
- **Alternativa:** una versión del portafolio con un framework frontend (Astro, React + Vite) en una carpeta o repo aparte.

Confirmar con el usuario cuál se hará antes de empezarlo. El sitio principal debe funcionar al 100% sin depender del plus.

## 16. Contenido del portafolio

### Perfil
- **Nombre:** Jhon Reyes
- **Rol:** Desarrollador de Software | Java · Spring Boot · PostgreSQL
- **Sobre mí:** Desarrollador de software en formación, con enfoque en el desarrollo backend utilizando Java y Spring Boot. Cuenta con experiencia académica y práctica construyendo aplicaciones web, APIs REST, bases de datos relacionales e integraciones mediante herramientas de automatización. Le interesa desarrollar soluciones bien estructuradas, comprender la lógica detrás de cada implementación y seguir fortaleciendo sus conocimientos en arquitectura de software y buenas prácticas de desarrollo. *(En el sitio se escribe en primera persona.)*

### Stack tecnológico
- **Lenguajes:** Java, JavaScript, Python, SQL
- **Backend:** Spring Boot, Spring Security, Spring Data JPA
- **Frontend:** HTML5, CSS3
- **Bases de datos:** PostgreSQL, MySQL
- **Herramientas:** Git, Docker, Linux, n8n

### Proyectos destacados
1. **CampusDesk — Sistema de Gestión de Soporte Técnico.** Aplicación web para gestionar incidencias tecnológicas, con autenticación JWT, control de acceso por roles, asignación de técnicos y seguimiento de tickets. API REST con arquitectura por capas y persistencia mediante JPA.
   Stack: Java, Spring Boot, Spring Security, PostgreSQL, JavaScript. Categoría: backend.
2. **RapidExpress — Sistema de Gestión de Flotas y Rutas.** Sistema backend para operaciones logísticas: vehículos, conductores, paquetes, rutas y mantenimientos. Validaciones de negocio, seguimiento de entregas, reportes y persistencia en MySQL.
   Stack: Java, MySQL, Maven. Arquitectura: MVC. Categoría: backend.
3. **SmartCity Fix — Plataforma de Reportes Ciudadanos.** Desarrollada en un hackathon para reportar y gestionar incidentes urbanos. Mapas interactivos, automatización con n8n y servicios externos para reportes y notificaciones.
   Stack: JavaScript, Node.js, Leaflet.js, Docker, n8n, APIs externas. Categoría: hackathon.
4. **Sistema de Gestión de Coworking.** Base de datos relacional para clientes, membresías, reservas, facturación y control de accesos. Reglas de negocio con más de 20 triggers y eventos programados.
   Stack: MySQL. Categoría: bases de datos.
5. **Gestión de Proyectos de Construcción.** Aplicación web para el seguimiento de personal, actividades, hitos y cronogramas, con interfaz en JavaScript. Tiene demo.
   Stack: JavaScript, HTML, CSS. Categoría: frontend.

### Otros proyectos
- **Hackathon NeoMetro:** gestión de incidentes ciudadanos mediante mapas, automatización e integración de APIs. (hackathon)
- **Tienda de música:** interfaz responsive con HTML y CSS. Tiene demo. (frontend)
- **Proyecto Python:** ejercicios y estructuras fundamentales de programación. (fundamentos)

### Datos pendientes (pedir al usuario, no inventar)
- [ ] URLs de los repositorios de cada proyecto y de las demos.
- [x] Correo de contacto, URL de LinkedIn y usuario de GitHub.
- [ ] Foto de perfil y capturas de cada proyecto.
- [x] CV en PDF.
- [ ] Preferencia de colores (si tiene una).
- [ ] Opción elegida para el plus framework (§15).

## 17. Reglas para Claude

- Antes de dar algo por terminado, revisa la rúbrica (§2) y verifica que no rompiste ningún criterio.
- Prueba los cambios con un servidor local; no asumas que funcionan.
- Mantén el código limpio: nombres claros, sin código muerto, sin `console.log` en producción, comentarios solo donde aporten.
- CSS: metodología consistente (BEM recomendado), sin `!important` salvo justificación, sin estilos inline.
- JS: `const`/`let`, módulos ES, funciones pequeñas, sin variables globales.
- No agregues librerías sin consultar.
- No inventes datos personales, enlaces ni métricas: usa placeholders `TODO` y avisa.
- No hagas commits ni push sin que el usuario lo pida; cuando los hagas, sigue §4.

## 18. Skills de diseño instaladas

Instaladas en `.claude/skills/` (registro en `skills-lock.json`). **Orden de prioridad cuando haya conflicto:** instrucciones del usuario → rúbrica (§2) → este CLAUDE.md → skills.

### Qué skill usar en cada fase

| Fase | Skill | Para qué |
|---|---|---|
| 1. Dirección visual | `design-taste-frontend` (Taste) | Paleta, tipografía, hero, layout de secciones, evitar el look "genérico hecho por IA". Leer sus `references/` (`system.md`, `layout-v4.md`, `copy.md`, `motion.md`). |
| 2. Estructura y jerarquía | `impeccable` | Jerarquía visual, layout, tipografía, color, responsive, accesibilidad. Usar sus referencias `layout.md`, `typeset.md`, `colorize.md`, `adapt.md`, `clarify.md`, `distill.md`. |
| 3. Animaciones | `animate`, `choreograph` | Construir cada animación (hero, entrada de tarjetas, filtros, menú, tema). |
| 4. Rendimiento del movimiento | `animation-performance` | Solo `transform`/`opacity`, sin jank. |
| 5. Móvil | `mobile-native` | Hover pegajoso en táctil, bug de `100vh`, tap highlight, áreas táctiles. |
| 6. Revisión final | `impeccable` (audit/polish/critique), `review-animations`, `find-animation-opportunities`, `emil-design-eng` | Auditoría antes de cada release. `improve-animations` solo planifica, no edita. |

### Adaptaciones obligatorias

- **Taste** está pensada para sitios de empresas (software, producto, lugar). Un portafolio no está en su tabla: tratarlo como `service` (una persona que se contrata) para tono y paleta, pero **no** seguir su flujo de "deal" al pie de la letra ni sus reglas de "una sección por pantalla" si chocan con la navegabilidad o el contenido. Se toman sus principios (un solo sistema, bordes iguales, copy concreto, nada inventado, micro-interacciones, prohibición del violeta/lavanda como acento), no su proceso completo.
- Taste prohíbe pies de foto bajo imágenes; en este proyecto `<figcaption>` es opcional y solo si aporta.
- No usar fotos de stock como si fueran capturas reales de los proyectos. Si faltan capturas, usar placeholder marcado `TODO` y pedirlas.

### Seguridad y scripts (no ejecutar sin preguntar)

- **Taste** declara un **hook `Stop`** que ejecuta `node scripts/gate.mjs` (lanza Chrome headless, hasta 10 min) cuando la skill está activa. Sus scripts también descargan iconos (jsDelivr/GitHub) y fotos (Wikimedia/Picsum). Ninguno se ejecuta sin confirmación del usuario. Se usa como **referencia de lectura**.
- **Impeccable** puede descargar un binario ("engine") desde los releases de GitHub (verificado por SHA-256) para su modo *live* y sus hooks. No ejecutar `scripts/impeccable` ni configurar sus hooks sin confirmación; usar solo `SKILL.md` y `reference/`.
- **Emil Kowalski**: solo instrucciones, sin scripts.
- No editar los archivos de las skills.

### Git

`.claude/skills/` y `skills-lock.json` son herramientas de desarrollo (Taste pesa ~35 MB). Agregar `.claude/skills/` y `.agents/` al `.gitignore` para no inflar el repositorio que verán los reclutadores. Mantener `CLAUDE.md` versionado.
