"""Cambia el carrusel de logos de clientes por una grilla fija (index y nosotros).

En celular la cinta animada cargaba cada logo recien al entrar en pantalla
(loading=lazy + 42 imagenes con el clon), y aparecian tarde y cortados.
"""
import os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

for f in ("index.html", "nosotros.html"):
    h = open(f, encoding="utf8").read()
    m = re.search(r'    <div class="logos-carrusel">\n      <div class="logos-track">\n(.*?)\n      </div>\n    </div>\n', h, re.S)
    if not m:
        sys.exit(f"{f}: no encontré el carrusel")
    logos = m.group(1).replace(' loading="lazy"', "")
    nuevo = f'    <div class="wrap">\n      <div class="logos-grilla">\n{logos}\n      </div>\n    </div>\n'
    h = h[:m.start()] + nuevo + h[m.end():]
    open(f, "w", encoding="utf8", newline="").write(h)
    print(f, "->", logos.count("<img"), "logos en grilla")

css = open("estilos.css", encoding="utf8").read()
if ".logos-grilla" not in css:
    ancla = "  .logos-carrusel{"
    if ancla not in css:
        sys.exit("estilos.css: no encontré .logos-carrusel")
    css = css.replace(ancla,
        "  /* Grilla fija de logos de clientes: todos visibles a la vez, sin animacion\n"
        "     (reemplaza a la cinta, que en celular cargaba los logos tarde). */\n"
        "  .logos-grilla{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:36px 40px;align-items:center;justify-items:center;margin-top:28px}\n"
        "  @media(max-width:640px){.logos-grilla{grid-template-columns:repeat(3,1fr);gap:26px 18px}.logos-grilla img.client{max-width:100%}}\n"
        + ancla, 1)
    open("estilos.css", "w", encoding="utf8", newline="").write(css)
    print("estilos.css: grilla agregada")
