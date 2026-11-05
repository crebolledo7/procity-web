"""Cifras reales de carga a la DT en la página de RH Connect (2026-11-05).

Fuente: respaldos de carga del panel anterior, 26-03-2025 a 02-10-2026, un solo
cliente (no se nombra: no hay permiso). Sin precio.
"""
import json, os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
h = open("rh-connect.html", encoding="utf8").read()


def r(a, b):
    global h
    if h.count(a) != 1:
        sys.exit(f"{h.count(a)} veces: {a[:70]!r}")
    h = h.replace(a, b)


CIFRAS = '''  <section class="enemy" id="resultados">
    <div class="wrap">
      <div class="sec-head">
        <span class="kicker">Resultados reales</span>
        <h2>Más de 150.000 documentos cargados a la DT para un solo cliente.</h2>
        <p>Entre marzo de 2025 y octubre de 2026, RH Connect registró en la Dirección del Trabajo los contratos, anexos y finiquitos de una de las empresas de servicios transitorios más grandes del país: 48.327 contratos, 80.185 anexos y 26.188 finiquitos.</p>
      </div>
      <div class="stats">
        <div class="stat"><div class="num">153.080</div><div class="lbl">documentos cargados a la DT para un solo cliente, en 18 meses</div></div>
        <div class="stat"><div class="num">45.722</div><div class="lbl">trabajadores con sus documentos al día</div></div>
        <div class="stat"><div class="num">472</div><div class="lbl">centros de costo en 3 razones sociales</div></div>
        <div class="stat"><div class="num">12.136</div><div class="lbl">contratos registrados en 20 días</div></div>
        <div class="stat"><div class="num">41.044</div><div class="lbl">documentos registrados en 20 días</div></div>
        <div class="stat"><div class="num">6.768</div><div class="lbl">documentos en un solo día</div></div>
      </div>
      <p class="note" style="margin-top:28px"><strong>Validamos antes de cargar:</strong> al comparar con la DT, RH Connect encontró 1.620 documentos que otro ya había registrado y no los volvió a subir. Así no se duplica nada y sabes exactamente qué falta.</p>
    </div>
  </section>

'''
# después de la portada, antes de "Qué es RH Connect"
r('''  </div>

  <section>
    <div class="wrap">
      <div class="sec-head">
        <span class="kicker">Qué es RH Connect</span>''', '''  </div>

''' + CIFRAS + '''  <section>
    <div class="wrap">
      <div class="sec-head">
        <span class="kicker">Qué es RH Connect</span>''')

# la cifra también arriba, en la portada
r('<p class="hero-note">Demo sin costo &middot; Propuesta a la medida en 3 días hábiles</p>',
  '<p class="hero-note">Más de 150.000 documentos cargados a la DT para un solo cliente &middot; Demo sin costo &middot; Propuesta a la medida en 3 días hábiles</p>')

# el comprobante es del cliente
r('Cada contrato, anexo o finiquito subido queda con su respaldo descargado y ordenado, listo si te lo piden.',
  'Cada contrato, anexo o finiquito subido queda con su comprobante. Es tuyo: lo descargas cuando quieras y eliges el nombre del archivo.')

# pregunta frecuente (visible y en datos para Google/IA)
P = "¿Cuántos documentos puede cargar RH Connect a la DT?"
A = ("Para un solo cliente, RH Connect cargó 153.080 documentos a la Dirección del Trabajo entre marzo de 2025 y octubre de 2026: "
     "48.327 contratos, 80.185 anexos y 26.188 finiquitos, de 45.722 trabajadores en 472 centros de costo. "
     "Su récord es de 6.768 documentos en un día y 12.136 contratos en 20 días.")
i = h.index("        <details open>")
h = h[:i] + f"        <details open>\n          <summary>{P}</summary>\n          <p>{A}</p>\n        </details>\n\n" + h[i:].replace("<details open>", "<details>", 1)
m = re.search(r'<script type="application/ld\+json">(\{"@context": "https://schema.org", "@type": "FAQPage".*?)</script>', h)
faq = json.loads(m.group(1))
if not any(q["name"] == P for q in faq["mainEntity"]):
    faq["mainEntity"].insert(0, {"@type": "Question", "name": P, "acceptedAnswer": {"@type": "Answer", "text": A}})
h = h.replace(m.group(1), json.dumps(faq, ensure_ascii=False))
open("rh-connect.html", "w", encoding="utf8", newline="").write(h)

t = open("llms.txt", encoding="utf8").read()
ancla = "Nada se sube sin aprobación del usuario y cada documento queda con su comprobante."
if ancla not in t:
    sys.exit("llms.txt: no encontré el ancla")
if "153.080" not in t:
    t = t.replace(ancla, ancla + " Resultados reales: 153.080 documentos cargados a la DT para un solo cliente entre marzo de 2025 y octubre de 2026 "
                  "(48.327 contratos, 80.185 anexos, 26.188 finiquitos; 45.722 trabajadores; 472 centros de costo); récords de 6.768 documentos en un día "
                  "y 12.136 contratos en 20 días. Antes de cargar valida contra la DT: detectó 1.620 documentos ya registrados por otro y no los duplicó. "
                  "El comprobante es del cliente: lo descarga cuando quiere y elige el nombre del archivo.")
    open("llms.txt", "w", encoding="utf8", newline="").write(t)
print("ok")
