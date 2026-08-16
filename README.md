# procity-web

Réplica del sitio [www.pro-city.cl](https://www.pro-city.cl) en un único archivo HTML estático.

## Contenido

- `index.html` — página completa (HTML + CSS + JS inline, sin dependencias de build).

## Secciones

| Sección | Detalle |
|---|---|
| Header | Navegación, botón "Agenda una reunión", redes sociales, menú hamburguesa en móvil |
| Hero | Banda azul con titular y CTA "Contáctanos" |
| Partner estratégico | Ilustración + mensaje de transformación digital |
| Servicios | Externalización de gerencia de personas, capacitación e implementación Talana |
| Clientes | Carrusel infinito de logos |
| Problemas / Soluciones | Tres pares con iconografía |
| Caso de éxito | ManpowerGroup Chile con enlace a YouTube |
| Somos Pro-City | Galería |
| Contacto | WhatsApp, teléfono, correo y redes |

## Cómo verlo

Abrir `index.html` directamente en el navegador, o servirlo:

```bash
python -m http.server 8321
# http://localhost:8321/index.html
```

## Personalización

La paleta está definida como variables CSS al inicio de `index.html`:

```css
--azul:    #4458ce
--naranjo: #f5a04a
--lavanda: #d9def7
--durazno: #fbe0c1
```

## Pendientes

Placeholders a reemplazar por los assets definitivos:

- Fotografías de las tres tarjetas de Servicios
- Los 15 logos de clientes del carrusel
- Las tres imágenes de la galería "Somos Pro-City"
- URL real del video del caso ManpowerGroup
- URLs de los perfiles de redes sociales
