"""Genera articulos del blog de pro-city.cl a partir de un JSON de guias.

Uso: python -I herramientas/generar_guias.py <guias.json> [fecha AAAA-MM-DD]
Usa blog-que-es-un-paralelo-de-remuneraciones.html como molde y reemplaza
metadatos, el BlogPosting, una FAQPage y el <main>.
"""
import html as H
import json
import math
import os
import re
import sys

SITIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CAL = "https://calendar.app.google/4k6nLR3WYzGfWJeJ6"

datos = json.load(open(sys.argv[1], encoding="utf8"))
fecha = sys.argv[2] if len(sys.argv) > 2 else "2026-10-30"
molde = open(os.path.join(SITIO, "blog-que-es-un-paralelo-de-remuneraciones.html"), encoding="utf8").read()


def esc(s):
    return H.escape(s, quote=True)


def con_enlaces(s):
    """Escapa el texto y vuelve clicables las direcciones de pro-city.cl."""
    t = esc(s)
    return re.sub(r"https://pro-city\.cl/([a-z0-9-]+)",
                  lambda m: f'<a href="{m.group(1)}.html">pro-city.cl/{m.group(1)}</a>', t)


def sub1(h, patron, nuevo):
    h2, n = re.subn(patron, lambda m: nuevo, h, count=1, flags=re.S)
    if n != 1:
        sys.exit(f"no encontré {patron[:60]!r}")
    return h2


for g in datos["guias"]:
    url = f"https://pro-city.cl/{g['slug']}"
    h = molde
    h = sub1(h, r"<title>.*?</title>", f"<title>{esc(g['title'])}</title>")
    h = sub1(h, r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(g["desc"])}">')
    h = sub1(h, r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">')
    h = sub1(h, r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{esc(g["title"])}">')
    h = sub1(h, r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{esc(g["desc"])}">')
    h = sub1(h, r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">')

    post = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": g["h1"], "description": g["desc"],
            "datePublished": fecha, "dateModified": fecha, "inLanguage": "es-CL",
            "mainEntityOfPage": {"@type": "WebPage", "@id": url},
            "author": {"@id": "https://pro-city.cl/#organization"}, "publisher": {"@id": "https://pro-city.cl/#organization"},
            "isPartOf": {"@type": "Blog", "@id": "https://pro-city.cl/blog", "name": "Blog de Pro-City"},
            "citation": [f["url"] for f in g.get("fuentes", [])]}
    faq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in g["faq"]]}
    h = sub1(h, r'<script type="application/ld\+json">\{"@context":"https://schema.org","@type":"BlogPosting".*?</script>',
             f'<script type="application/ld+json">{json.dumps(post, ensure_ascii=False)}</script>\n'
             f'<script type="application/ld+json">{json.dumps(faq, ensure_ascii=False)}</script>')

    palabras = len(" ".join([g["respuesta_corta"]] + [" ".join(s.get("parrafos", []) + s.get("lista", [])) for s in g["secciones"]]).split())
    minutos = max(3, math.ceil(palabras / 200))
    cuerpo = [f'        <p class="lead" style="font-weight:500">{con_enlaces(g["respuesta_corta"])}</p>\n',
              '        <p class="note">¿Tienes muchos contratos, anexos o finiquitos que registrar? '
              '<a href="#demo"><strong>RH Connect los carga a la DT por ti &rarr;</strong></a></p>\n']
    for s in g["secciones"]:
        cuerpo.append(f'        <h2>{esc(s["h2"])}</h2>\n')
        for p in s.get("parrafos", []):
            cuerpo.append(f"        <p>{con_enlaces(p)}</p>\n")
        if s.get("lista"):
            tag = "ol" if s.get("lista_numerada") else "ul"
            cuerpo.append(f"        <{tag}>\n" + "".join(f"          <li>{con_enlaces(li)}</li>\n" for li in s["lista"]) + f"        </{tag}>\n")
    cuerpo.append("        <h2>Preguntas frecuentes</h2>\n")
    for q, a in g["faq"]:
        cuerpo.append(f"        <h3>{esc(q)}</h3>\n        <p>{con_enlaces(a)}</p>\n")
    if g.get("fuentes"):
        cuerpo.append('        <h2>Fuentes</h2>\n        <ul>\n' + "".join(
            f'          <li><a href="{esc(f["url"])}" target="_blank" rel="noopener">{esc(f["titulo"])}</a></li>\n' for f in g["fuentes"])
            + "        </ul>\n")
    cuerpo.append(f'        <p><em>Información revisada al {fecha[8:10]}-{fecha[5:7]}-{fecha[:4]}. Los trámites de la Dirección del Trabajo pueden cambiar: ante dudas, confirma en dt.gob.cl.</em></p>\n')

    main = f'''<main>

  <div class="hero" style="padding:64px 0 56px">
    <div class="wrap">
      <div class="post-head">
        <span class="kicker on-dark">Guía · Dirección del Trabajo</span>
        <h1 style="font-size:clamp(1.7rem,3.2vw,2.6rem)">{esc(g["h1"])}</h1>
        <p style="color:rgba(255,255,255,.72);margin-top:22px;font-size:15px">Guía · {minutos} min de lectura</p>
      </div>
    </div>
  </div>

  <section>
    <div class="wrap">
      <div class="post-body">
{"".join(cuerpo)}      </div>
      <div class="panel" id="demo" style="margin-top:48px">
        <span class="kicker">RH Connect</span>
        <h3>¿Muchos documentos para la DT? Te mostramos cómo cargarlos sin hacerlo uno por uno</h3>
        <p>RH Connect compara lo que tienes en Talana o Buk con lo que tiene registrado la Dirección del Trabajo, te muestra qué falta y lo sube por ti. Ya lleva más de 150.000 documentos cargados. Déjanos tus datos y te agendamos una demo de 30 minutos.</p>
        <form data-demo-rhc novalidate>
          <div class="form-row">
            <input type="text" name="nombre" placeholder="Tu nombre" aria-label="Tu nombre" required autocomplete="name">
            <input type="text" name="empresa" placeholder="Empresa" aria-label="Empresa" required autocomplete="organization">
          </div>
          <div class="form-row" style="margin-top:10px">
            <input type="email" name="email" placeholder="tu@empresa.cl" aria-label="Correo electrónico" required autocomplete="email" inputmode="email">
            <input type="tel" name="telefono" placeholder="Teléfono (opcional)" aria-label="Teléfono" autocomplete="tel">
            <button class="btn btn-primary" type="submit">Quiero una demo</button>
          </div>
          <input type="text" name="website" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true">
        </form>
        <p data-demo-estado aria-live="polite" style="font-size:.9rem;margin-top:14px"></p>
      </div>
      <div class="post-nav">
        <a class="btn btn-primary" href="blog.html">&larr; Volver al blog</a>
        <a class="btn btn-ghost" href="rh-connect.html">Conoce RH Connect</a>
      </div>
    </div>
  </section>

</main>'''
    i = h.index("<main>")
    j = h.index("</main>") + len("</main>")
    h = h[:i] + main + h[j:]
    if "js/demo-rhc.js" not in h:
        h = h.replace("</body>", '<script src="js/demo-rhc.js?v=20261112" defer></script>\n</body>', 1)
    open(os.path.join(SITIO, g["slug"] + ".html"), "w", encoding="utf8", newline="").write(h)
    print("creada:", g["slug"] + ".html", "|", palabras, "palabras |", minutos, "min")
