# Portafolio · Jhon Reyes

Portafolio profesional de **Jhon Reyes**, desarrollador de software backend con Java, Spring Boot y PostgreSQL. Reúne los proyectos construidos durante el entrenamiento, el stack tecnológico y una forma directa de contacto.

**Sitio en línea:** [jhonhenryreyesperez.github.io/PORTFOLIO](https://jhonhenryreyesperez.github.io/PORTFOLIO/)

<!-- TODO: captura o GIF del portafolio -->

## Funcionalidades

- **Responsive, mobile-first:** probado de 320 px a 1440 px, sin scroll horizontal.
- **Tema claro y oscuro:** sigue la preferencia del sistema y recuerda la elección del usuario. El tema claro usa un lenguaje de cristal inspirado en iOS (Liquid Glass): un campo de color fijo detrás de la página, paneles de vidrio esmerilado con borde de luz y una cabecera en cápsula flotante. Con `prefers-reduced-transparency` el vidrio pasa a superficies sólidas.
- **Carga dinámica con peticiones locales:** el stack, los proyectos y el perfil se cargan con `fetch()` desde archivos JSON en `data/`. El panel del inicio muestra la petición real a `data/profile.json` con su estado HTTP y su tiempo de respuesta.
- **Proyectos con enlace al repositorio y a la demo** cuando existe.
- **Filtro de proyectos por categoría**, con botones accesibles (`aria-pressed`) y anuncio del resultado a lectores de pantalla.
- **Contacto por correo:** enlace `mailto:`, botón para copiar el correo y un formulario validado que abre la aplicación de correo con el asunto y el mensaje listos.
- **Animaciones con propósito:**
  - Entrada coreografiada del inicio, luz que sigue al cursor con una rejilla de puntos y un fondo de color (aurora) que se mueve muy despacio.
  - Cinta de tecnologías en bucle que solo corre cuando está en pantalla; su botón de pausa detiene también la aurora.
  - Frase de "Sobre mí" que se enciende palabra por palabra, ligada al scroll.
  - Cada proyecto tiene su color y un panel visual propio: diagramas donde un pulso recorre las capas (CampusDesk, SmartCity Fix), módulos MVC (RapidExpress), modelo de datos (Coworking) y la captura de la demo en un marco de navegador (CampusBuild).
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
│   ├── css/      reset, tokens (colores y tipografía), base, layout, componentes, animaciones, efectos y cristal (glass.css)
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

## Imágenes y recursos

- **Foto de perfil:** recortada a 3:4 y convertida a WebP en dos anchos (360 px ≈ 9 KB y 640 px ≈ 20 KB, frente a 79 KB del JPEG original), servida con `srcset`, `width`/`height` explícitos y `loading="lazy"`.
- **Logos del stack:** [Simple Icons](https://simpleicons.org) 16.37.0 (CC0), reunidos en un sprite local `assets/icons/tech.svg` de ~24 KB. Las marcas pertenecen a sus respectivos dueños.

## Autor

**Jhon Reyes** · [jhonrysprzhh@gmail.com](mailto:jhonrysprzhh@gmail.com) · [LinkedIn](https://www.linkedin.com/in/jhon-reyes-6b76b63aa/) · [GitHub](https://github.com/JhonHenryReyesPerez)
