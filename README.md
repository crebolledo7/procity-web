# procity-web

Sitio estático de **Pro-City** — partner de implementación y migración de sistemas de remuneraciones (BUK, Talana, Rex+) en Chile.

## Estructura

```
index.html        Home — implementación y migración sin descuadres
planes.html       Cinco planes cerrados
servicios.html    Migración, históricos, paralelo, payroll, integraciones
nosotros.html     Equipo y trayectoria
blog.html         Índice del blog
blog-*.html       Artículos: tres casos de cliente y seis guías
estilos.css       Sistema visual compartido
animaciones.js    Aparición al hacer scroll, contadores y carrusel de logos
img/clientes/     21 logos de clientes
robots.txt        Directivas de rastreo
sitemap.xml       Mapa del sitio
GUIA-SEO.md       Guía de implementación en WordPress
```

## Cómo verlo

Abrir `index.html` en el navegador, o servirlo:

```bash
python -m http.server 8322
# http://localhost:8322/index.html
```

## Enlaces

Los enlaces internos son **relativos** (`planes.html`, `servicios.html`, `nosotros.html`) para que el sitio funcione como archivos estáticos y en GitHub Pages.

El blog vive dentro de este repo (`blog.html` y las `blog-*.html`); los tres casos de cliente vienen del blog anterior de `pro-city.cl`, que se da de baja.

`/agenda` todavía no existe acá: apunta a `https://pro-city.cl/agenda/`.

Los `<link rel="canonical">`, `og:url`, JSON-LD y `sitemap.xml` **sí** usan las URLs absolutas de producción (`https://pro-city.cl/planes/`, etc.), que es lo correcto para SEO. Al montar en WordPress hay que volver los enlaces internos a rutas absolutas — ver `GUIA-SEO.md`.

## Sistema visual

Definido en `estilos.css` según el manual de identidad:

```css
--blue:   #425CC7   /* Pantone 2726 C */
--orange: #E36C09   /* acento */
--white:  #FFFFFF
--black:  #000000
```

Tipografía de marca: Gotham (Black 900 / Medium 500 / Light 300). Sustituto web: Montserrat.

## SEO

Cada página incluye title y meta description propios, un solo `<h1>` con la keyword objetivo, y JSON-LD: `ProfessionalService`, `WebSite`, `ItemList` de `SiteNavigationElement`, `BreadcrumbList`, más `OfferCatalog` en Planes y Servicios y `FAQPage` en la home.

Detalle completo de estrategia, URLs y pasos de publicación en [`GUIA-SEO.md`](GUIA-SEO.md).

## Pendientes antes de publicar

Auditoría revisada el 2026-09-15 — lo que sigue son decisiones de negocio, no de código:

- [ ] Confirmar el plazo real de entrega de propuesta: `index.html` dice "3 días hábiles", las landings de servicio dicen "5 días hábiles".
- [ ] Confirmar la cifra real de "% de proyectos entregados en fecha": `index.html` muestra 98.4%, `GUIA-SEO.md` documenta 95%.
- [ ] Decidir si "Pro-City Holding" es una cuarta línea de negocio o se funde en Migración Limpia (`planes.html` dice "tres líneas" pero muestra cuatro tarjetas).
- [ ] Decidir si "Horas de asesoría a demanda" se mantiene por hora o se reempaqueta como alcance cerrado (choca con "sin bolsas de horas" del resto del copy).
- [ ] Redactar la cita textual de cada testimonio en `nosotros.html` (los 4 videos ya están, falta la frase de cada cliente) y confirmar la cita del fundador.
- [ ] Decidir si los metadatos (title, description, JSON-LD) llevan tildes; hoy van sin ellas y el cuerpo sí las lleva.
- [ ] Confirmar que los 21 clientes se pueden nombrar públicamente.
- [ ] Validar la frase de escasez del topbar o eliminarla.
- [ ] Regenerar los PNG de logo en `#425CC7` o corregir el manual (los oficiales están en `#385CC7`).
- [ ] Foto o video del fundador.
- [ ] Antes de conectar el cotizador en producción: generar el `TOKEN_SECRETO` real en `apps-script/enviar-propuestas.gs` (el script ya rechaza el valor de ejemplo).

Resueltos en esta pasada: los seis `[XX]` ya no están, la nota interna de `nosotros.html` se quitó, los tres logos de marca (favicon, header, footer) se sacaron de base64 a `img/marca/*.png` (~40 KB menos por página), se agregó `loading="lazy"` a los 42 logos de clientes del carrusel, el JSON-LD de navegación ahora incluye "Inicio" (5 secciones), y `aria-current="page"` quedó consistente en todas las páginas.
