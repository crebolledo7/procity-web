"""Agrega las guias de la DT al indice del blog, al sitemap y a llms.txt."""
import html, json, os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
G = []
for n in "abcd":
    G += json.load(open(f"herramientas/guias_{n}.json", encoding="utf8"))["guias"]

tarjetas = ""
for g in G:
    if f'href="{g["slug"]}.html"' in open("blog.html", encoding="utf8").read():
        continue
    tarjetas += f'''        <a class="post-card" href="{g["slug"]}.html">
          <span class="post-tag">Guía DT</span>
          <h2>{html.escape(g["h1"])}</h2>
          <p>{html.escape(g["respuesta_corta"].split(". ")[0].rstrip(".") + ".")}</p>
          <span class="post-meta">30 de octubre de 2026 &middot; 5 min</span>
          <span class="leer">Leer la guía &rarr;</span>
        </a>
'''
b = open("blog.html", encoding="utf8").read()
if b.count('<div class="blog-grid">\n') != 1:
    sys.exit("blog.html: no encontré la grilla")
b = b.replace('<div class="blog-grid">\n', '<div class="blog-grid">\n' + tarjetas, 1)
open("blog.html", "w", encoding="utf8", newline="").write(b)

s = open("sitemap.xml", encoding="utf8").read()
s = s.replace("</urlset>", "".join(
    f"  <url>\n    <loc>https://pro-city.cl/{g['slug']}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n"
    for g in G if f"/{g['slug']}</loc>" not in s) + "</urlset>")
open("sitemap.xml", "w", encoding="utf8", newline="").write(s)

t = open("llms.txt", encoding="utf8").read()
if "## Guías sobre trámites en la Dirección del Trabajo" not in t:
    t += "\n## Guías sobre trámites en la Dirección del Trabajo\n\n" + "".join(
        f"- [{g['h1']}](https://pro-city.cl/{g['slug']}): {g['respuesta_corta']}\n" for g in G)
open("llms.txt", "w", encoding="utf8", newline="").write(t)
print("tarjetas:", tarjetas.count("post-card"), "| sitemap:", s.count("<loc>"))
