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
- **Asistente con IA (la nutria):** un botón flotante abre un chat que responde preguntas sobre el perfil, el stack y los proyectos. Lo atiende una API propia en Spring Boot (ver [API del asistente](#api-del-asistente-plus)) que usa DeepSeek y solo responde con los datos de `data/`. El chat se descarga al acercar el puntero o enfocar el botón, la ventana se opera con teclado (Esc cierra y devuelve el foco), los mensajes se anuncian con `aria-live` y, si la API no responde, ofrece el correo como alternativa. Si no hay API configurada, el botón no aparece.
- **Accesibilidad:** HTML semántico, enlace para saltar al contenido, foco visible, navegación completa con teclado, contraste WCAG AA verificado.

## Tecnologías

- HTML5 semántico
- CSS3 (custom properties, Grid, Flexbox, `clamp()`), sin frameworks
- JavaScript (ES Modules), sin dependencias
- Java 21 + Spring Boot 4 (API del asistente), Maven, JUnit 5 y Mockito
- Docker + Render para desplegar la API
- GitHub Actions + GitHub Pages para el despliegue

## Estructura

```
├── index.html
├── 404.html
├── assets/
│   ├── css/      reset, tokens (colores y tipografía), base, layout, componentes, animaciones, efectos y cristal (glass.css)
│   ├── js/       un módulo por responsabilidad (api, proyectos, stack, navegación, tema, contacto, assistant/)
│   ├── icons/
│   └── img/
├── data/         profile.json, skills.json, projects.json
├── api/          API del asistente (Spring Boot): chat, límites de uso, cliente de DeepSeek y pruebas
├── render.yaml   despliegue de la API en Render
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

## API del asistente (plus)

API REST en **Spring Boot 4 / Java 21** dentro de `api/`. El frontend sigue funcionando al 100 % sin ella: el asistente es lo único que la usa.

| Endpoint | Descripción |
|---|---|
| `POST /api/chat` | Recibe `{ "messages": [{ "role": "user", "content": "..." }] }` y devuelve `{ "reply": "..." }` |
| `GET /api/health` | Comprobación de estado (también despierta el servidor del plan gratuito) |

- **Base de conocimiento:** Maven empaqueta los mismos `data/*.json` del sitio; el prompt de sistema obliga al modelo a responder solo con esos datos, sin inventar.
- **Seguridad:** la clave de DeepSeek vive solo en el servidor (variable `DEEPSEEK_API_KEY`), nunca en el frontend. CORS limitado al dominio del portafolio, validación de entrada (máx. 20 mensajes de 600 caracteres) y límite de uso: 15 preguntas cada 10 minutos por visitante y 300 al día en total.
- **Errores:** formato estándar `application/problem+json` (RFC 9457) con mensajes en español (400, 429 con `Retry-After`, 503).

Ejecutarla en local (requiere JDK 21):

```bash
cd api
# la clave va en api/config/application.properties (ignorado por Git):
#   deepseek.api-key=sk-...
./mvnw spring-boot:run      # http://localhost:8080
./mvnw test                 # 23 pruebas
```

Con el sitio servido en `127.0.0.1:5500`, el asistente usa automáticamente `http://localhost:8080`.

**Despliegue:** `render.yaml` define el servicio Docker (`api/Dockerfile`) en Render. La URL pública se pone en `<meta name="assistant-endpoint">` de `index.html`. En el plan gratuito el servidor se duerme tras un rato sin uso; la primera respuesta puede tardar hasta un minuto y el chat lo avisa.

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
- **API:** 23 pruebas (JUnit 5, Mockito, `@WebMvcTest`, `MockRestServiceServer`) cubren el endpoint, la validación, CORS, el límite de uso, el cliente de DeepSeek y la base de conocimiento.
- **Viewports:** `tests/viewports.html` muestra el sitio a 320, 390 y 768 px a la vez.
- _TODO: resultados de Lighthouse, validadores W3C y pruebas automatizadas._

## Imágenes y recursos

- **Foto de perfil:** recortada a 3:4 y convertida a WebP en dos anchos (360 px ≈ 9 KB y 640 px ≈ 20 KB, frente a 79 KB del JPEG original), servida con `srcset`, `width`/`height` explícitos y `loading="lazy"`.
- **Mascota:** recortada del fondo y convertida a WebP: cuerpo a 160/320 px (14 y 36 KB) y cabeza a 64/128 px (3 y 7,5 KB), con `srcset`. El avatar de la ventana se carga con `loading="lazy"`.
- **Logos del stack:** [Simple Icons](https://simpleicons.org) 16.37.0 (CC0), reunidos en un sprite local `assets/icons/tech.svg` de ~24 KB. Las marcas pertenecen a sus respectivos dueños.

## Autor

**Jhon Reyes** · [jhonrysprzhh@gmail.com](mailto:jhonrysprzhh@gmail.com) · [LinkedIn](https://www.linkedin.com/in/jhon-reyes-6b76b63aa/) · [GitHub](https://github.com/JhonHenryReyesPerez)
