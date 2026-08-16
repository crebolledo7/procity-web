# procity-web

Sitio estático de **Pro-City** — partner de implementación y migración de sistemas de remuneraciones (BUK, Talana, Rex+) en Chile.

## Estructura

```
index.html        Home — implementación y migración sin descuadres
planes.html       Cinco planes cerrados
servicios.html    Migración, históricos, paralelo, payroll, integraciones
nosotros.html     Equipo y trayectoria
estilos.css       Sistema visual compartido
img/clientes/     16 logos de clientes
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

`/blog` y `/agenda` todavía no existen en este repo: apuntan a `https://pro-city.cl/blog/` y `https://pro-city.cl/agenda/`.

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

- [ ] Reemplazar los seis `[XX]` por cifras reales — `index.html` (3) y `nosotros.html` (3): años de experiencia, migraciones acompañadas, empresas acompañadas, liquidaciones validadas y % de proyectos entregados en fecha.
- [ ] Quitar la nota interna visible en `nosotros.html` ("Nota para Cristóbal…") y confirmar la cita del fundador.
- [ ] Decidir si los metadatos (title, description, JSON-LD) llevan tildes; hoy van sin ellas y el cuerpo sí las lleva.
- [ ] Confirmar que los 16 clientes se pueden nombrar públicamente.
- [ ] Validar la frase de escasez del topbar o eliminarla.
- [ ] Sacar los logos de base64 a archivos `.webp` (hoy inflan cada HTML).
- [ ] Regenerar los PNG de logo en `#425CC7` o corregir el manual (los oficiales están en `#385CC7`).
- [ ] Foto o video del fundador.
