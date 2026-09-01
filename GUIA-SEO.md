# Guía SEO Pro-City

Documento para quien implemente el sitio en WordPress.

---

## 1. Cómo funcionan realmente los sitelinks (lo que viste en Fintual)

Conviene ser exacto, porque hay dos cosas distintas en esa captura y ninguna se "activa" con un código:

**El menú de enlaces bajo el resultado** son *sitelinks*. Google los genera solo, de forma algorítmica. **No existe un tag, un plugin ni un schema que los fuerce.** Lo único que puedes hacer es darle a Google las condiciones para que los muestre:

- Que existan URLs separadas y estables, cada una con un tema claro
- Que el título de cada página sea único y descriptivo (Google usa ese texto como etiqueta del sitelink)
- Que la navegación interna sea consistente: el mismo menú, con los mismos textos, en todas las páginas
- Que haya un sitemap enviado en Search Console
- Que la marca tenga búsquedas propias — los sitelinks aparecen casi siempre en consultas de marca ("pro-city", "procity")

Fintual los tiene porque cumple los cinco y porque su marca se busca miles de veces al mes. Pro-City puede cumplir los cuatro primeros ya; el quinto crece con el tiempo y con la actividad de marketing.

**El bloque "Más preguntas"** es *People Also Ask*. También lo genera Google a partir de lo que la gente busca, no del código de la página. Nota importante: en agosto de 2023 Google restringió los resultados enriquecidos de tipo FAQ a sitios de gobierno y salud, así que el schema `FAQPage` ya casi no genera el desplegable en resultados. Se incluye igual porque sigue ayudando a que Google entienda el contenido y porque alimenta las respuestas en IA y asistentes.

Conclusión honesta: esto no es un interruptor. Es estructura correcta más tiempo más marca. Lo que entrego deja la parte estructural resuelta.

---

## 2. Estrategia de palabras clave

Pro-City **no debe competir** por "software de remuneraciones Chile" ni "mejor sistema de RRHH". Esas búsquedas ya están dominadas por Buk, Nubox, Talana, Defontana y Rex+, que son los propios fabricantes y tienen blogs enormes. Además atraen a alguien que quiere *comprar software*, no *implementarlo*.

El terreno de Pro-City es el que esos fabricantes no cubren: **la implementación, la migración y la cuadratura.**

### Prioridad 1 — Núcleo del negocio

| Consulta objetivo | Página |
|---|---|
| implementación BUK / partner BUK Chile | Servicios y landing futura |
| implementación Talana / partner Talana | Servicios y landing futura |
| implementación Rex+ | Servicios |
| migrar software de remuneraciones | Home |
| cambiar de sistema de remuneraciones | Home |

### Prioridad 2 — Dolor específico (poco volumen, altísima intención)

| Consulta objetivo | Página |
|---|---|
| carga de históricos de remuneraciones | Servicios y landing futura |
| paralelo de remuneraciones | Servicios |
| impuesto único no cuadra con F29 | Blog |
| migrar de sistema a mitad de año | Planes |
| liquidaciones no cuadran después de migrar | Home y Blog |

### Prioridad 3 — Servicios adyacentes

| Consulta objetivo | Página |
|---|---|
| externalizar remuneraciones / BPO nómina Chile | Servicios y landing futura |
| integración API remuneraciones contabilidad | Servicios |
| centralización contable remuneraciones | Servicios |
| capacitación Talana / capacitación BUK | Servicios |

---

## 3. Mapa de URLs, títulos y H1

Regla aplicada: **un solo H1 por página**, con la palabra clave objetivo, describiendo lo que la empresa hace. El mensaje comercial anterior pasó a ser un subtítulo bajo el H1, que conserva la fuerza del copy sin sacrificar el posicionamiento.

### `/` — index.html

- **Title (56 car.):** Implementación de BUK, Talana y Rex+ en Chile | Pro-City
- **H1:** Implementación de software de remuneraciones sin descuadres
- **Subtítulo:** Cámbiate de sistema de remuneraciones sin que se te caiga un mes.
- **Meta description (158 car.):** Partner de implementación de BUK, Talana y Rex+ en Chile. Migramos tu sistema de remuneraciones validando el 100% de los cálculos, con garantía de cuadratura.

### `/planes/` — planes.html

- **Title (65 car.):** Planes de implementación y migración de remuneraciones | Pro-City
- **H1:** Planes de implementación y migración de remuneraciones
- **Subtítulo:** Elige por el problema que tienes.

### `/servicios/` — servicios.html

- **Title (63 car.):** Servicios: migración, históricos, paralelo y payroll | Pro-City
- **H1:** Servicios de implementación, migración y payroll de remuneraciones
- **Subtítulo:** Todo lo que hay entre «decidimos cambiar de sistema» y «el equipo lo usa solo».

### `/nosotros/` — nosotros.html

- **Title (70 car.):** Quiénes somos: especialistas en migración de remuneraciones | Pro-City
- **H1:** Especialistas en migración de sistemas de remuneraciones en Chile
- **Subtítulo:** No somos una consultora de tecnología. Somos gente de remuneraciones.

Todos los títulos quedaron entre 50 y 70 caracteres y las descripciones entre 120 y 165, que es lo que Google alcanza a mostrar sin cortar.

### Landings por servicio

Cuatro páginas nuevas, cada una dedicada a **una sola** consulta objetivo. Esta es la diferencia que hace que Google las prefiera por sobre la home: la home menciona las tres plataformas a la vez, la landing trata una.

#### `/implementacion-buk/` — implementacion-buk.html

- **Consultas objetivo:** implementación BUK, partner BUK Chile, migrar a BUK
- **Title (61 car.):** Partner de Buk en Chile: implementación y migración | Pro-City
- **H1:** Implementación de BUK en Chile
- **Subtítulo:** Cámbiate a BUK sin que se te caiga un mes.
- **Badge del hero:** Partner de Buk

#### `/implementacion-talana/` — implementacion-talana.html

- **Consultas objetivo:** implementación Talana, partner Talana, integración API Talana, Talana Perú
- **Title (50 car.):** Implementación de Talana en Chile y Perú | Pro-City
- **H1:** Implementación de Talana en Chile y Perú
- **Subtítulo:** Gestión de personas, remuneraciones y firma digital, funcionando de verdad.
- **Badge del hero:** 5 años implementando Talana

#### `/implementacion-rex/` — implementacion-rex.html

- **Consultas objetivo:** implementación Rex+, migrar a Rex+, Rex+ no cuadra
- **Title (41 car.):** Implementación de Rex+ en Chile | Pro-City
- **H1:** Implementación de Rex+ en Chile
- **Subtítulo:** Misma metodología de hitos y paralelo, aplicada a Rex+.

#### `/migracion-remuneraciones/` — migracion-remuneraciones.html

- **Consultas objetivo:** migrar software de remuneraciones, cambiar de sistema de remuneraciones, migrar a mitad de año, las liquidaciones no cuadran después de migrar, qué es un paralelo de remuneraciones
- **Title (61 car.):** Migrar de software de remuneraciones sin descuadres | Pro-City
- **H1:** Migración de software de remuneraciones
- **Subtítulo:** Cambiar de sistema no tiene por qué costarte un mes de cierre.

**Enlaces internos ya construidos** (sin esto las landings no reciben peso):

- Home → sección «¿A qué plataforma vas a migrar?» con las cuatro
- Servicios → «Ver detalle» en cada tarjeta de implementación
- Footer de todas las páginas → columna «Implementaciones»
- Cada landing → cruza a las otras tres y a Planes, Servicios y Agenda

---

## 4. Datos estructurados incluidos

Cada página lleva JSON-LD válido en el `<head>`:

- **ProfessionalService** — la ficha de la empresa: nombre, RUT, dirección, teléfono, países atendidos, redes sociales y `knowsAbout` con las especialidades. Es lo que alimenta el panel de marca.
- **WebSite** — identifica el sitio y su editor.
- **ItemList de SiteNavigationElement** — declara explícitamente las cinco secciones principales con nombre y descripción. Es la señal más directa que se le puede dar a Google sobre qué páginas son candidatas a sitelink.
- **BreadcrumbList** — la ruta de navegación de cada página.
- **OfferCatalog con 9 Service** — en Planes y Servicios, describe cada servicio con su nombre y descripción.
- **FAQPage** — en la home, con las 9 objeciones reales.

Verificar en el Test de Resultados Enriquecidos de Google y en Schema.org Validator antes de publicar.

---

## 5. Qué hacer en WordPress

1. **Crear las páginas con estas URLs exactas:** `/`, `/planes/`, `/servicios/`, `/nosotros/`, `/implementacion-buk/`, `/implementacion-talana/`, `/implementacion-rex/`, `/migracion-remuneraciones/`. Mantener `/blog` y `/agenda` que ya existen.
2. **Cambiar el nombre del sitio.** Hoy el `og:site_name` y todos los títulos dicen "Implementación Talana". Debe decir "Pro-City". Está en Ajustes → Generales y en la configuración del plugin SEO.
3. **Cargar title y meta description** de la sección 3 en el plugin SEO (Yoast o Rank Math), página por página. No dejar que se autogeneren.
4. **Pegar los bloques JSON-LD** en el `<head>` de cada página. Si usan Rank Math, conviene desactivar su schema automático para evitar duplicados.
5. **Subir `sitemap.xml` y `robots.txt`.** Si el plugin SEO ya genera un sitemap, usar ese y descartar el mío, pero verificar que incluya las cuatro páginas.
6. **Verificar la propiedad en Google Search Console** y enviar el sitemap. Sin esto Google tarda mucho más en descubrir la estructura nueva.
7. **Redirecciones 301** desde cualquier URL antigua que se elimine, hacia su equivalente nueva. Nunca dejar un 404.
8. **Menú idéntico en todas las páginas**, con los mismos textos: Inicio, Planes, Servicios, Nosotros, Blog. La consistencia del anchor text es una de las señales que Google usa para elegir sitelinks.

---

## 6. Lo que más va a mover la aguja después

En orden de impacto:

1. ~~**Landings por servicio.**~~ **Hecho para las cuatro principales** (BUK, Talana, Rex+ y migración). Quedan pendientes las de servicios individuales: confección de históricos, paralelo, payroll externalizado e integraciones. Cada una es una URL más apuntando a una búsqueda con intención de compra clarísima, y una candidata más a sitelink.
2. **Blog respondiendo preguntas reales.** "¿Por qué mi impuesto único no cuadra con el F29?", "¿Puedo cambiar de sistema de remuneraciones a mitad de año?", "¿Qué es un paralelo de remuneraciones?". Este es el camino directo a aparecer en People Also Ask.
3. **Reseñas en Google.** Fintual y FitFood muestran calificación porque tienen perfil de empresa con reseñas. Vale la pena crear o reclamar el perfil de Google Business y pedirles reseña a los clientes que quedaron contentos.
4. **Velocidad de carga.** Los logos van embebidos en base64 para que el demo sea un archivo único; en producción deben ser archivos `.webp` normales.

---

## 7. Cómo se nombra la relación con cada plataforma

Esto importa legalmente y conviene no improvisarlo página por página.

- **BUK — «Partner de Buk».** Es el término que usa el propio BUK. Pro-City tiene ficha publicada en su directorio de partners: <https://info.buk.cl/quienes-somos/partners/alianza-con-pro-city>, bajo la categoría «administradores e implementadores externos». No se usa «partner oficial», «certificado» ni «autorizado», porque BUK tampoco los usa; en su lugar se enlaza la ficha, que es prueba verificable y convence más que un adjetivo. Si BUK asigna un nivel formal con nombre propio, se reemplaza en: `implementacion-buk.html` (title, meta description, badge del hero, lead, FAQ, nota, JSON-LD de Service), `index.html` (badge del hero, meta description, lead, tarjeta), `nosotros.html` (bloque «Alianzas») y el JSON-LD de organización de las 8 páginas.
- **Talana — «cinco años implementando Talana».** El registro formal como partner todavía no está tramitado, así que **no se usa la palabra partner como afirmación**. La página incluye la pregunta «¿Trabajan como partner de Talana?» —porque es la consulta que la gente escribe— y la responde diciendo que se trabaja como especialista independiente que no revende licencias. Cuando el registro salga, actualizar esa respuesta y el badge.
- **Rex+ — sin claim de relación comercial.** Solo metodología.

## 8. Animaciones al hacer scroll

Están en `animaciones.js` (~150 líneas, sin librerías externas) más un bloque al final de `estilos.css`. Talana usa AOS + jQuery para lo mismo; acá se hace con `IntersectionObserver` nativo para no sumar ~15 KB de dependencias a un sitio cuyo pendiente declarado es la velocidad de carga.

Tres efectos:

1. **Aparición progresiva.** Los textos entran desde la izquierda (coherente con la regla del manual: alineación siempre a la izquierda) y las tarjetas suben, escalonadas de a 70 ms. El hero queda excluido: se ve completo de entrada.
2. **Contadores.** Los indicadores numéricos cuentan desde cero al entrar en pantalla. Entiende `5`, `50+`, `80 mil`, `95%` y miles con punto.
3. **Resaltado de conversión.** El bloque CTA se eleva cuando queda a la vista, el selector de plan de la home se ilumina, y el botón «Agenda tu diagnóstico» del header hace un pulso único al dejar atrás el hero.

Tres decisiones que **no hay que romper al pasar esto a WordPress**:

- **El estado oculto vive bajo `html.js-anim`**, clase que agrega el propio script. Sin JavaScript la página se ve completa: Google indexa el contenido igual y nadie queda con una pantalla en blanco.
- **Los contadores tienen red de seguridad.** `requestAnimationFrame` se congela cuando la pestaña pasa a segundo plano; sin el `setTimeout` de respaldo el número se queda a medio camino y muestra un dato falso (se vio `20%` donde dice `95%`). Además, el valor real vive en el HTML y solo se pone en cero en el instante en que arranca el conteo.
- **Se respeta `prefers-reduced-motion`.** Si el sistema pide menos movimiento no se activa nada.

**Bug corregido de paso:** el botón del menú móvil tenía un `onclick` en el HTML *y* un `addEventListener` en un script inline al final de cada página. Los dos togglean la misma clase, así que se anulaban y el menú no abría en móvil. Se eliminó el script inline en las 8 páginas y quedó solo el `onclick`. Verificado con clics reales: primer clic abre, segundo cierra.

## 9. Testimonios en video

Sección «Lo que dicen nuestros clientes» en `nosotros.html`, con los cuatro videos de clientes del canal de YouTube (`@pro-city1221`). Los cinco videos del canal son: Empresas Jofré, Empresas Torre, ManpowerGroup Chile, Club de Polo y Equitación San Cristóbal, y una presentación institucional de 18 segundos que no se usa acá.

| Empresa | ID del video | Publicado | Duración |
|---|---|---|---|
| Empresas Jofré | `2h-lzgGGNxk` | 28-04-2022 | 1:10 |
| Empresas Torre S.A. | `PwSUZ1xqpw8` | 20-07-2023 | 1:22 |
| ManpowerGroup Chile | `fcolWcg92X0` | 06-06-2023 | 1:30 |
| Club de Polo y Equitación San Cristóbal | `2jkmyFKWRPo` | 11-07-2023 | 1:30 |

Decisiones técnicas:

- Se usa **`youtube-nocookie.com`** en vez de `youtube.com`: no deja cookies de seguimiento hasta que el visitante le da play. Es la opción más limpia frente a la ley de datos personales y evita tener que declararlo en un banner de cookies.
- Los cuatro iframes van con `loading="lazy"`: no pesan nada hasta que el visitante llega a la sección.
- La grilla usa `minmax(min(420px,100%),1fr)`. El `min()` es obligatorio: sin él la columna se queda fija en 420 px y provoca scroll horizontal en móviles angostos.
- Hay un **`ItemList` de cuatro `VideoObject`** en el `<head>`, con nombre, descripción, miniatura, fecha de publicación, duración y URL de embed. Es lo que habilita el resultado enriquecido de video en Google, que ocupa mucho más espacio en la página de resultados que un resultado de texto. Verificar en el Test de Resultados Enriquecidos.

**Pendiente:** la cita textual de cada cliente para destacarla sobre su video. YouTube dejó de entregar las transcripciones automáticas por API y el panel de transcripción no carga, así que las fichas se armaron con la descripción de cada video —información verificable— y no con frases inventadas. Los videos tienen los subtítulos incrustados en la imagen, así que las citas se pueden leer directamente viéndolos.

## 10. Pendientes de contenido

- ~~Cifras reales para reemplazar los `[XX]`.~~ **Hecho.** Las cifras vigentes son: **5** años en remuneraciones, **50+** empresas acompañadas, **80 mil** liquidaciones validadas en paralelos y **95%** de proyectos entregados en fecha. Si cambian, están en `index.html` (bloque `.rating` y las dos `.stat` del bloque del fundador) y `nosotros.html` (las tres `.stat`). Conviene poder respaldarlas si un cliente las pregunta.
- Confirmar si la cita del fundador representa a Cristóbal o se reescribe.
- Foto o video del fundador para el bloque que hoy es un marcador.
- Confirmar que los 21 clientes se pueden nombrar públicamente.
- Definir si la frase de escasez del topbar es cierta; si no lo es, eliminarla.
- Los logos oficiales están en `#385CC7` pero el manual de marca especifica `#425CC7`. Regenerar los PNG o corregir el manual.
