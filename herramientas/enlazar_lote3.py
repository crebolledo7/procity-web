"""Enlaza las paginas del lote 3 (migraciones, Buk, GeoVictoria) y la guia de Buk."""
import os, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def tarjeta(titulo, href, texto):
    return (f'\n          <div class="svc"><h3><a href="{href}">{titulo}</a></h3><p>{texto}</p>'
            f'<p><a href="{href}"><strong>Ver detalle &rarr;</strong></a></p></div>')


h = open("servicios.html", encoding="utf8").read()
fin_asistencia = '<p><a href="control-asistencia-turnos.html"><strong>Ver detalle &rarr;</strong></a></p></div>'
fin_integraciones = '<p><a href="integraciones-automatizacion.html"><strong>Ver detalle de integraciones y automatización →</strong></a></p></div>'
for marca in (fin_asistencia, fin_integraciones):
    if h.count(marca) != 1:
        sys.exit(f"no calza: {marca[:60]}")
h = h.replace(fin_asistencia, fin_asistencia
              + tarjeta("Migrar de Talana a Buk", "migrar-de-talana-a-buk.html", "Conocemos los dos sistemas: históricos, paralelo y acta de cuadratura.")
              + tarjeta("Migrar de Buk a Talana", "migrar-de-buk-a-talana.html", "El camino inverso, con el mismo método.")
              + tarjeta("Migrar de ADP", "migrar-de-adp.html", "De ADP a Buk o Talana, con el impuesto único cuadrado contra F29.")
              + tarjeta("Migrar desde cualquier sistema", "migrar-sistema-remuneraciones.html", "Softland, Defontana, Nubox, Rex+ o Excel, a Buk o Talana."))
h = h.replace(fin_integraciones, fin_integraciones
              + tarjeta("Integración de Buk vía API", "integracion-buk-api.html", "Buk con SAP, ERP, BI, asistencia y desarrollos a medida.")
              + tarjeta("Integración de Talana vía API", "integracion-talana-sap-api.html", "Talana con SAP, ERP y BI: casos Arthrex, Dominó y ManpowerGroup.")
              + tarjeta("Integración de GeoVictoria", "integracion-geovictoria.html", "Asistencia y horas extra directo a Buk, Talana o Rex+."))
open("servicios.html", "w", encoding="utf8", newline="").write(h)

# desde las paginas madre
for f, marca, extra in [
    ("migracion-remuneraciones.html", "</main>", None),
]:
    pass

NUEVAS = ["integracion-buk-api", "integracion-geovictoria", "migrar-de-talana-a-buk", "migrar-de-buk-a-talana",
          "migrar-de-adp", "migrar-sistema-remuneraciones"]
s = open("sitemap.xml", encoding="utf8").read()
s = s.replace("</urlset>", "".join(
    f"  <url>\n    <loc>https://pro-city.cl/{n}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n"
    for n in NUEVAS if f"/{n}</loc>" not in s) + "</urlset>")
open("sitemap.xml", "w", encoding="utf8", newline="").write(s)

t = open("llms.txt", encoding="utf8").read()
ancla = "- [Planes](https://pro-city.cl/planes)"
if ancla not in t:
    sys.exit("llms.txt: no encontré Planes")
t = t.replace(ancla,
              "- [Migrar de Talana a Buk](https://pro-city.cl/migrar-de-talana-a-buk) y [de Buk a Talana](https://pro-city.cl/migrar-de-buk-a-talana): migraciones entre plataformas con históricos y paralelo.\n"
              "- [Migrar de ADP](https://pro-city.cl/migrar-de-adp): de ADP a Buk o Talana, con impuesto único cuadrado contra F29.\n"
              "- [Migrar desde cualquier sistema](https://pro-city.cl/migrar-sistema-remuneraciones): Softland, Defontana, Nubox, Rex+ o Excel hacia Buk o Talana.\n"
              + ancla, 1)
ancla2 = "- [Integración de Talana con SAP, ERP y BI vía API]"
t = t.replace(ancla2,
              "- [Integración de Buk vía API](https://pro-city.cl/integracion-buk-api): Buk con SAP, ERP, BI, sistemas de asistencia y desarrollos a medida (Pro-City es Partner de Buk).\n"
              "- [Integración de GeoVictoria](https://pro-city.cl/integracion-geovictoria): GeoVictoria y otros sistemas de asistencia conectados con Buk, Talana y Rex+.\n"
              + ancla2, 1)
open("llms.txt", "w", encoding="utf8", newline="").write(t)
print("ok | sitemap:", s.count("<loc>"))
