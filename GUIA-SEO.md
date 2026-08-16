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

1. **Crear las páginas con estas URLs exactas:** `/`, `/planes/`, `/servicios/`, `/nosotros/`. Mantener `/blog` y `/agenda` que ya existen.
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

1. **Landings por servicio.** Una página por cada servicio grande — implementación BUK, implementación Talana, confección de históricos, paralelo, payroll, integraciones. Son seis URLs más, cada una apuntando a una búsqueda con intención de compra clarísima, y seis candidatas más a sitelink.
2. **Blog respondiendo preguntas reales.** "¿Por qué mi impuesto único no cuadra con el F29?", "¿Puedo cambiar de sistema de remuneraciones a mitad de año?", "¿Qué es un paralelo de remuneraciones?". Este es el camino directo a aparecer en People Also Ask.
3. **Reseñas en Google.** Fintual y FitFood muestran calificación porque tienen perfil de empresa con reseñas. Vale la pena crear o reclamar el perfil de Google Business y pedirles reseña a los clientes que quedaron contentos.
4. **Velocidad de carga.** Los logos van embebidos en base64 para que el demo sea un archivo único; en producción deben ser archivos `.webp` normales.

---

## 7. Pendientes de contenido

- Cifras reales para reemplazar los `[XX]`: años de experiencia, empresas acompañadas, liquidaciones validadas y porcentaje de proyectos entregados en fecha.
- Confirmar si la cita del fundador representa a Cristóbal o se reescribe.
- Foto o video del fundador para el bloque que hoy es un marcador.
- Confirmar que los 16 clientes se pueden nombrar públicamente.
- Definir si la frase de escasez del topbar es cierta; si no lo es, eliminarla.
- Los logos oficiales están en `#385CC7` pero el manual de marca especifica `#425CC7`. Regenerar los PNG o corregir el manual.
