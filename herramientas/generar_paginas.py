"""Genera paginas de servicio de pro-city.cl a partir de un JSON de contenido.

Uso: python -I generar_paginas.py <contenido.json>
Usa implementacion-rex.html como molde (head, menu, pie, analitica) y
reemplaza solo metadatos, datos estructurados y el <main>.
"""
import html as H
import json
import os
import re
import sys

SITIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CAL = "https://calendar.app.google/4k6nLR3WYzGfWJeJ6"
WA = "https://api.whatsapp.com/send/?phone=56937669574&amp;text="

contenido = json.load(open(sys.argv[1], encoding="utf8"))
molde = open(os.path.join(SITIO, "implementacion-rex.html"), encoding="utf8").read()


def esc(s):
    return H.escape(s, quote=True)


def sub1(h, patron, nuevo):
    h2, n = re.subn(patron, lambda m: nuevo, h, count=1, flags=re.S)
    if n != 1:
        sys.exit(f"no encontré {patron[:60]!r}")
    return h2


for p in contenido["paginas"]:
    url = f"https://pro-city.cl/{p['slug']}"
    h = molde
    h = sub1(h, r"<title>.*?</title>", f"<title>{esc(p['title'])}</title>")
    h = sub1(h, r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(p["desc"])}">')
    h = sub1(h, r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">')
    h = sub1(h, r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{esc(p["title"])}">')
    h = sub1(h, r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{esc(p["desc"])}">')
    h = sub1(h, r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">')

    # datos estructurados: se conservan empresa, sitio y navegacion; se rehacen miga, servicio y FAQ
    padre = p.get("padre", ["Servicios", "servicios"])
    miga = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://pro-city.cl/"},
        {"@type": "ListItem", "position": 2, "name": padre[0], "item": f"https://pro-city.cl/{padre[1]}"},
        {"@type": "ListItem", "position": 3, "name": p["h1"], "item": url}]}
    servicio = {"@context": "https://schema.org", "@type": "Service", "name": p["servicio"], "description": p["desc"],
                "url": url, "serviceType": p["servicio"], "provider": {"@id": "https://pro-city.cl/#organization"},
                "areaServed": {"@type": "Country", "name": "Chile"}}
    if p.get("tipos"):
        servicio["hasOfferCatalog"] = {"@type": "OfferCatalog", "name": p["servicio"], "itemListElement": [
            {"@type": "Offer", "itemOffered": {"@type": "Service", "name": t}} for t in p["tipos"]]}
    faq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]}
    ld = "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in (miga, servicio, faq))
    i = h.index('<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList"')
    j = h.index("<!-- Cloudflare")
    h = h[:i] + ld + h[j:]

    chips = "".join(f'<span class="chip">{esc(c)}</span>' for c in p["chips"])
    tarjetas = "".join(
        f'<div class="svc"><h3>{esc(t["h3"])}</h3><p>{esc(t["p"])}</p>'
        + ("<ul>" + "".join(f"<li>{esc(li)}</li>" for li in t["ul"]) + "</ul>" if t.get("ul") else "")
        + "</div>" for t in p["tarjetas"])
    faq_html = "\n".join(
        f'        <details{" open" if k == 0 else ""}>\n          <summary>{esc(q)}</summary>\n          <p>{esc(a)}</p>\n        </details>\n'
        for k, (q, a) in enumerate(p["faq"]))
    relacionados = "".join(
        f'<div class="svc"><h3><a href="{r[1]}">{esc(r[0])}</a></h3><p>{esc(r[2])}</p><p><a href="{r[1]}"><strong>Ver detalle &rarr;</strong></a></p></div>'
        for r in p["relacionados"])
    wa = WA + p.get("wa", "Hola%2C%20quiero%20cotizar%20un%20servicio%20de%20Pro-City.")
    por_que = ""
    if p.get("por_que"):
        items = "".join(f'<div class="val"><div class="ic">{k + 1}</div><div><h4>{esc(a)}</h4><p>{esc(b)}</p></div></div>'
                        for k, (a, b) in enumerate(p["por_que"]))
        por_que = f'''
  <section class="enemy">
    <div class="wrap">
      <div class="two-col">
        <div class="sec-head" style="margin-bottom:0">
          <span class="kicker">Por qué Pro-City</span>
          <h2>{esc(p["por_que_h2"])}</h2>
        </div>
        <div class="val-list">{items}</div>
      </div>
    </div>
  </section>
'''
    main = f'''<main>

  <div class="hero" style="padding:72px 0 64px">
    <div class="wrap">
      <span class="kicker on-dark">{esc(p["kicker"])}</span>
      <h1 style="font-size:clamp(1.9rem,3.8vw,3rem)">{esc(p["h1"])}</h1>
      <p class="hero-sub">{esc(p["sub"])}</p>
      <p class="lead">{esc(p["lead"])}</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="{CAL}" target="_blank" rel="noopener">{esc(p.get("cta", "Agenda una reunión"))}</a>
        <a class="btn btn-outline-light" href="{wa}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>
      </div>
      <div class="platforms">{chips}</div>
      <p class="hero-note">Primera conversación sin costo &middot; Propuesta en 3 días hábiles</p>
    </div>
  </div>

  <section>
    <div class="wrap">
      <div class="sec-head">
        <span class="kicker">Qué es</span>
        <h2>{esc(p["que_es_h2"])}</h2>
        <p><strong>{esc(p["que_es"])}</strong></p>
      </div>
      <div class="svc-grid">
{tarjetas}
      </div>
    </div>
  </section>
{por_que}
  <section{' class="enemy"' if not p.get("por_que") else ""}>
    <div class="wrap">
      <div class="sec-head ctr">
        <span class="kicker">Preguntas frecuentes</span>
        <h2>{esc(p["faq_h2"])}</h2>
      </div>
      <div class="faq">

{faq_html}
      </div>
    </div>
  </section>

  <section{' class="enemy"' if p.get("por_que") else ""}>
    <div class="wrap">
      <div class="sec-head">
        <span class="kicker">También hacemos</span>
        <h2>Servicios relacionados</h2>
      </div>
      <div class="svc-grid">{relacionados}</div>
    </div>
  </section>

  <div class="cta-outer">
    <div class="cta">
      <h2>{esc(p["cta_h2"])}</h2>
      <p>{esc(p["cta_p"])}</p>
      <div class="cta-btns"><a class="btn btn-light" href="{CAL}" target="_blank" rel="noopener">{esc(p.get("cta", "Agenda una reunión"))}</a><a class="btn btn-outline-light" href="mailto:contacto@procity.live?subject={esc(p["servicio"])}">Escríbenos</a></div>
    </div>
  </div>

</main>'''
    i = h.index("<main>")
    j = h.index("</main>") + len("</main>")
    h = h[:i] + main + h[j:]
    # menu: Servicios activo; boton flotante de WhatsApp con mensaje del servicio
    h = h.replace("text=Hola%2C%20necesito%20ayuda%20con%20mi%20sistema%20de%20remuneraciones.\" target=\"_blank\" rel=\"noopener\" aria-label=\"Escribenos",
                  "text=" + wa.split("text=")[1] + "\" target=\"_blank\" rel=\"noopener\" aria-label=\"Escribenos")
    open(os.path.join(SITIO, p["slug"] + ".html"), "w", encoding="utf8", newline="").write(h)
    print("creada:", p["slug"] + ".html", "| titulo", len(p["title"]), "car. | descripcion", len(p["desc"]), "car.")
