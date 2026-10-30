"""RH Connect funciona con Talana y con Buk (corrección de Cristóbal, 2026-10-30).

Uso: python -I herramientas/rhc_buk.py <carpeta con guias_a/b/c.json>
Cada reemplazo debe aparecer al menos una vez; si no, se detiene.
"""
import json, os, sys

SITIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
GUIAS = sys.argv[1]


def aplicar(ruta, cambios):
    t = open(ruta, encoding="utf8").read()
    for viejo, nuevo in cambios:
        if viejo not in t:
            sys.exit(f"{os.path.basename(ruta)}: no encontré {viejo[:70]!r}")
        t = t.replace(viejo, nuevo)
    open(ruta, "w", encoding="utf8", newline="").write(t)
    print("ok", os.path.basename(ruta), len(cambios), "cambios")


aplicar(os.path.join(SITIO, "rh-connect.html"), [
    ("Carga masiva de documentos a la DT desde Talana | RH Connect", "Carga masiva a la DT desde Talana y Buk | RH Connect"),
    ("Compara Talana con el Registro Electrónico Laboral y sube lo que falta.", "Compara Talana o Buk con el Registro Electrónico Laboral y sube lo que falta."),
    ("Tus contratos de Talana, al día en la DT, sin cuadrar planillas a mano.", "Tus contratos de Talana o Buk, al día en la DT, sin cuadrar planillas a mano."),
    ("RH Connect compara lo que tienes en Talana con lo que tiene registrado la DT", "RH Connect compara lo que tienes en Talana o Buk con lo que tiene registrado la DT"),
    ('<span class="chip">Talana</span><span class="chip">Dirección del Trabajo</span>', '<span class="chip">Talana</span><span class="chip">Buk</span><span class="chip">Dirección del Trabajo</span>'),
    ("Toma la información desde Talana, la compara", "Toma la información desde Talana o Buk, la compara"),
    ("Funciona para cualquier empresa que use Talana, con una o varias razones sociales.", "Funciona para cualquier empresa que use Talana o Buk, con una o varias razones sociales."),
    ("Detecta los anexos firmados en Talana que", "Detecta los anexos firmados en tu sistema que"),
    ("Cruza los finiquitos de Talana con la DT", "Cruza los finiquitos de Talana o Buk con la DT"),
    ("Los contratos ya están en Talana, pero también", "Los contratos ya están en Talana o Buk, pero también"),
    ("Se firmó un anexo en Talana y nadie lo subió a la DT.", "Se firmó un anexo en el sistema y nadie lo subió a la DT."),
    ("Si el estado en la DT no coincide con Talana,", "Si el estado en la DT no coincide con tu sistema,"),
    ("Se conecta a Talana con las credenciales de tu empresa", "Se conecta a Talana o Buk con las credenciales de tu empresa"),
    ("Con RH Connect conectas Talana una vez:", "Con RH Connect conectas Talana o Buk una vez:"),
    ("¿RH Connect reemplaza a Talana?", "¿RH Connect reemplaza a Talana o Buk?"),
    ("No. Talana sigue siendo el sistema donde administras a tu personal.", "No. Talana o Buk siguen siendo el sistema donde administras a tu personal."),
    ("RH Connect está disponible para cualquier empresa que use Talana, haya hecho", "RH Connect está disponible para cualquier empresa que use Talana o Buk, haya hecho"),
    ("¿Funciona con Buk u otros sistemas?", "¿RH Connect funciona con Buk?"),
    ("Hoy funciona con Talana. La conexión con Buk está en desarrollo: si usas Buk, escríbenos y te avisamos cuando esté lista.",
     "Sí. RH Connect funciona con Talana y con Buk. Si usas otro sistema de remuneraciones, escríbenos y lo revisamos."),
    ('"Comparación de contratos entre Talana y la DT"', '"Comparación de contratos entre Talana o Buk y la DT"'),
    ('"Detección de finiquitos desalineados entre Talana y la DT"', '"Detección de finiquitos desalineados entre Talana o Buk y la DT"'),
])

aplicar(os.path.join(SITIO, "integraciones-automatizacion.html"), [
    ("Está disponible para cualquier empresa que use Talana, sea o no cliente", "Está disponible para cualquier empresa que use Talana o Buk, sea o no cliente"),
    ("Hoy es una plataforma disponible para cualquier empresa que use Talana, sea o no cliente", "Hoy es una plataforma disponible para cualquier empresa que use Talana o Buk, sea o no cliente"),
])

aplicar(os.path.join(SITIO, "llms.txt"), [
    ("a la Dirección del Trabajo (DT) desde Talana.", "a la Dirección del Trabajo (DT) desde Talana o Buk."),
    ("RH Connect](https://pro-city.cl/rh-connect): software chileno que compara los contratos de Talana con", "RH Connect](https://pro-city.cl/rh-connect): software chileno que compara los contratos de Talana o Buk con"),
    ("Sirve para empresas con una o varias razones sociales que usan Talana,", "Sirve para empresas con una o varias razones sociales que usan Talana o Buk,"),
    ("integración Talana con la DT,", "integración de Talana o Buk con la DT,"),
])

aplicar(os.path.join(GUIAS, "guias_a.json"), [
    ("la herramienta que desarrollamos en Pro-City para empresas que usan Talana.", "la herramienta que desarrollamos en Pro-City para empresas que usan Talana o Buk."),
    ("un software chileno que se conecta a Talana y compara los contratos", "un software chileno que se conecta a Talana o Buk y compara los contratos"),
    ("Lo que hay que saber: hoy RH Connect funciona solo con Talana (la conexión con Buk está en desarrollo) y está disponible para cualquier empresa que use Talana, sea o no cliente de Pro-City.",
     "Lo que hay que saber: RH Connect funciona con Talana y con Buk, y está disponible para cualquier empresa que use alguno de los dos, sea o no cliente de Pro-City."),
    ("Usa Talana, tiene mucho volumen", "Usa Talana o Buk, tiene mucho volumen"),
    ("Hoy RH Connect funciona solo con Talana. La conexión con Buk está en desarrollo.", "Sí. RH Connect funciona con Talana y con Buk."),
    ("RH Connect, la herramienta que desarrollamos para empresas que usan Talana.", "RH Connect, la herramienta que desarrollamos para empresas que usan Talana o Buk."),
    ("#RecursosHumanos #DireccionDelTrabajo #Talana", "#RecursosHumanos #DireccionDelTrabajo #Talana #Buk"),
])
aplicar(os.path.join(GUIAS, "guias_b.json"), [
    ("Si tu empresa usa Talana, RH Connect, el software", "Si tu empresa usa Talana o Buk, RH Connect, el software"),
    ("Si usas Talana, RH Connect, el software de Pro-City, detecta estos finiquitos desalineados (trabajador finiquitado en Talana que sigue vigente en la DT)",
     "Si usas Talana o Buk, RH Connect, el software de Pro-City, detecta estos finiquitos desalineados (trabajador finiquitado en tu sistema que sigue vigente en la DT)"),
])
aplicar(os.path.join(GUIAS, "guias_c.json"), [
    ("Hoy funciona con empresas que usan Talana.", "Funciona con empresas que usan Talana o Buk."),
    ("Está disponible para cualquier empresa que use Talana, sea o no cliente de Pro-City. Hoy funciona solo con Talana, y la versión para Buk está en desarrollo.",
     "Está disponible para cualquier empresa que use Talana o Buk, sea o no cliente de Pro-City. Si tu empresa usa Buk, RH Connect hace la misma comparación."),
])
# las guias deben seguir cargando
for n in "abc":
    json.load(open(os.path.join(GUIAS, f"guias_{n}.json"), encoding="utf8"))
print("guias validas")
