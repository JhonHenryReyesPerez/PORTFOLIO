# Portafolio · Jhon Reyes

Portafolio profesional de **Jhon Reyes**, desarrollador de software backend con Java, Spring Boot y PostgreSQL. Reúne los proyectos construidos durante el entrenamiento, el stack tecnológico y una forma directa de contacto.

**Sitio en línea:** _TODO: URL de GitHub Pages_

<!-- TODO: captura o GIF del portafolio -->

## Funcionalidades

- **Responsive, mobile-first:** probado de 320 px a 1440 px, sin scroll horizontal.
- **Tema claro y oscuro:** sigue la preferencia del sistema y recuerda la elección del usuario.
- **Carga dinámica con peticiones locales:** el stack, los proyectos y el perfil se cargan con `fetch()` desde archivos JSON en `data/`. El panel del inicio muestra la petición real a `data/profile.json` con su estado HTTP y su tiempo de respuesta.
- **Filtro de proyectos por categoría**, con botones accesibles (`aria-pressed`) y anuncio del resultado a lectores de pantalla.
- **Contacto por correo:** enlace `mailto:`, botón para copiar el correo y un formulario validado que abre la aplicación de correo con el asunto y el mensaje listos.
- **Animaciones con propósito:**
  - Entrada coreografiada del inicio y luz que sigue al cursor con una rejilla de puntos.
  - Cinta de tecnologías en bucle, con botón de pausa, que solo corre cuando está en pantalla.
  - Frase de "Sobre mí" que se enciende palabra por palabra, ligada al scroll.
  - Diagramas de arquitectura donde un pulso recorre las capas (petición en CampusDesk, reporte en SmartCity Fix).
  - Indicador del filtro que se desliza con `clip-path`, iconos que se cruzan con escala y desenfoque, entrada en grupo de los proyectos.
  - Todo respeta `prefers-reduced-motion` y tiene un estado final sin JavaScript.
- **Accesibilidad:** HTML semántico, enlace para saltar al contenido, foco visible, navegación completa con teclado, contraste WCAG AA verificado.

## Tecnologías

- HTML5 semántico
- CSS3 (custom properties, Grid, Flexbox, `clamp()`), sin frameworks
- JavaScript (ES Modules), sin dependencias
- GitHub Actions + GitHub Pages para el despliegue

## Estructura

```
├── index.html
├── 404.html
├── assets/
│   ├── css/      reset, tokens (colores y tipografía), base, layout, componentes y animaciones
│   ├── js/       un módulo por responsabilidad (api, proyectos, stack, navegación, tema, contacto)
│   ├── icons/
│   └── img/
├── data/         profile.json, skills.json, projects.json
├── tests/        herramientas de prueba
└── .github/workflows/deploy.yml
```

Para agregar o editar un proyecto solo hay que modificar `data/projects.json`; el HTML no cambia.

## Ejecutar en local

`fetch()` no funciona abriendo el archivo directamente (`file://`), así que hace falta un servidor local:

```bash
npx http-server . -p 5500 -c-1
# o
python -m http.server 5500
```

Luego abrir `http://127.0.0.1:5500`. También sirve la extensión Live Server de VS Code.

## Flujo de trabajo con Git

El repositorio sigue **Git Flow**:

- `main`: producción; cada push despliega en GitHub Pages.
- `develop`: integración.
- `feature/*`: una rama por funcionalidad, que se integra en `develop` con `--no-ff`.
- `release/*` y `hotfix/*`: preparación de versiones y correcciones urgentes.

Los mensajes de commit siguen **Conventional Commits** (`feat`, `fix`, `style`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`).

## Despliegue

El workflow `.github/workflows/deploy.yml` publica en GitHub Pages en cada push a `main`. Solo se publican los archivos del sitio (`index.html`, `404.html`, `assets/`, `data/`).

## Testing

- **Contraste:** todas las combinaciones de color se verificaron contra WCAG AA (texto ≥ 4.5:1, bordes de campos ≥ 3:1) en ambos temas.
- **Viewports:** `tests/viewports.html` muestra el sitio a 320, 390 y 768 px a la vez.
- _TODO: resultados de Lighthouse, validadores W3C y pruebas automatizadas._

## Autor

**Jhon Reyes** · _TODO: enlaces a LinkedIn y GitHub_
