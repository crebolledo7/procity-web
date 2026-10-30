/* ============================================================
   Pro-City · Seguimiento de propuestas comerciales
   ------------------------------------------------------------
   Vive dentro de la planilla "Seguimiento propuestas Pro-City"
   (Extensiones → Apps Script). Las páginas de propuesta
   (pro-city.cl/propuestas/{folio}.html) le avisan cuando:

     - el cliente ABRE la propuesta  → suma la apertura y, la
       primera vez, te manda un correo de aviso;
     - el cliente ACEPTA             → marca la fila "Aceptada",
       te avisa por correo y le manda al cliente la confirmación.

   Además, los formularios de pro-city.cl (cotizador de planes y
   descarga de las 12 preguntas) dejan cada contacto en la hoja
   "Contactos web" (se crea sola) y te avisan por correo.

   Cada propuesta es una fila (se crea sola la primera vez que
   llega un aviso con ese folio). El estado lo puedes cambiar a
   mano desde la lista desplegable: el color se ajusta solo.

   LIBRO ÚNICO (desde 2026-10-30): la hoja "Propuestas" reemplaza
   al Excel "Folios Propuestas comerciales". Tiene las columnas de
   siempre (rubro, servicio, UF, OC, factura, EDP...) más las del
   seguimiento automático. Los años 2021-2025 quedan en una hoja
   cada uno y "Resumen" cuenta aceptadas y rechazadas por año.
   El cotizador pide el próximo folio a doGet (accion=proximo_folio)
   y registra cada propuesta al publicarla (registrar_propuesta).
   Para traer el Excel antiguo, una sola vez: ▶ unificarLibros.

   INSTALACIÓN (una vez):
     1. Pega este archivo en Extensiones → Apps Script de la planilla.
     2. Elige la función "configurar" arriba y presiona ▶ Ejecutar.
        Google pide permisos (enviar correos y editar la planilla):
        acéptalos con crebolledo@procity.live.
     3. Implementar → Nueva implementación → tipo "Aplicación web"
        · Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario
        → Implementar → copia la URL que termina en /exec.
   ============================================================ */

// Debe ser la misma clave que usan las páginas de propuesta.
const TOKEN = "pc-j-J__ek-Rl8ksIXBxMjPgmvx";
// A quién le llegan los avisos.
const CORREO_AVISOS = "crebolledo@procity.live";
// Aviso por correo la primera vez que el cliente abre la propuesta.
const AVISAR_APERTURA = true;

const HOJA = "Propuestas";
// Columnas del libro único: primero las del Excel de folios (con nombres
// más claros), después las que llena el seguimiento automático.
const COLUMNAS = [
  "Folio", "Rev.", "Fecha", "Cliente", "Rubro", "Contacto", "Cargo", "Correo", "Celular",
  "Por dónde llega", "Persona que refiere", "Sistema", "Servicio", "Trabajadores", "Hrs",
  "Monto Neto UF", "Cant UF", "Descuento UF", "UF Neto", "Fecha UF", "Valor UF día", "Neto $",
  "Estado", "% de avance", "N° OC", "N° Factura", "EDP", "Fecha inicio", "Finaliza",
  "Opción 1 mes (UF)", "Opción 2 meses (UF)", "Opción 3 meses (UF)",
  "Link", "Aperturas", "Primera apertura", "Última apertura",
  "Opción aceptada", "Precio aceptado (UF)", "Fecha aceptación",
  "Próximo seguimiento", "Notas", "Interesado en"
];
const COL_FECHA = ["Fecha", "Fecha UF", "Fecha inicio", "Finaliza", "Próximo seguimiento"];
const COL_FECHA_HORA = ["Primera apertura", "Última apertura", "Fecha aceptación"];
const ESTADOS = [
  ["Enviada",        "#E8EAF6"],
  ["Pendiente",      "#E8EAF6"],
  ["Abierta",        "#FFF3CD"],
  ["En seguimiento", "#FFE0B2"],
  ["Aceptada",       "#C8E6C9"],
  ["Ganada",         "#81C784"],
  ["Rechazada",      "#F8BBD0"],
  ["Cerrada",        "#E0E0E0"]
];
// El libro unificado se arma desde este archivo (exportado del Excel antiguo
// con procity-cotizador/scripts/exportar-historico.py).
const ID_HISTORICO = "1-HoObenFaCOnJBLopNb_y--yACzESW1f";
// Columnas que tenía "Propuestas" antes de unificar (para leerla aunque
// alguien haya corrido configurar() y le haya cambiado los títulos).
const COLUMNAS_ANTIGUAS = [
  "Folio", "Cliente", "Contacto", "Correo", "Sistema",
  "Opción 1 mes (UF)", "Opción 2 meses (UF)", "Opción 3 meses (UF)",
  "Link", "Estado", "Aperturas", "Primera apertura", "Última apertura",
  "Opción aceptada", "Precio aceptado (UF)", "Fecha aceptación",
  "Próximo seguimiento", "Notas", "Interesado en"
];

/* ---------- instalación: hoja, encabezados, colores ---------- */
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone("America/Santiago");
  let hoja = ss.getSheetByName(HOJA);
  if (!hoja) {
    hoja = ss.getSheets()[0];
    hoja.setName(HOJA);
  }
  formatearPropuestas(hoja);
}

function formatearPropuestas(hoja) {
  const col = n => COLUMNAS.indexOf(n) + 1;
  hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
    .setFontWeight("bold").setBackground("#1E2761").setFontColor("#FFFFFF").setWrap(true);
  hoja.setFrozenRows(1);
  hoja.setFrozenColumns(4);
  hoja.getRange(1, col("Folio"), hoja.getMaxRows(), 1).setNumberFormat("@");   // folio como texto
  hoja.getRange(2, col("Rev."), hoja.getMaxRows() - 1, 1).setNumberFormat("00"); // 0 se ve como 00
  COL_FECHA.forEach(n => hoja.getRange(2, col(n), hoja.getMaxRows() - 1, 1).setNumberFormat("dd-mm-yyyy"));
  COL_FECHA_HORA.forEach(n => hoja.getRange(2, col(n), hoja.getMaxRows() - 1, 1).setNumberFormat("dd-mm-yyyy hh:mm"));

  hoja.getRange(2, col("Estado"), 1000, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS.map(e => e[0]), true).build()
  );
  const filas = hoja.getRange(2, 1, 1000, COLUMNAS.length);
  const letra = letraDe(col("Estado"));
  hoja.setConditionalFormatRules(ESTADOS.map(([estado, color]) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$${letra}2="${estado}"`)
      .setBackground(color).setRanges([filas]).build()
  ));
  hoja.setColumnWidth(col("Cliente"), 200);
  hoja.setColumnWidth(col("Servicio"), 200);
  hoja.setColumnWidth(col("Link"), 260);
  hoja.setColumnWidth(col("Notas"), 300);
}

function letraDe(n) {
  let s = "";
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/* ---------- unir el Excel antiguo con este libro (una sola vez) ---------- */
// Crea una hoja por año (2021-2025) tal como estaba en el Excel, rehace
// "Propuestas" con las columnas del libro único mezclando las propuestas 2026
// del Excel con las que ya registró el cotizador (por folio; si las dos
// tienen dato, gana el de esta planilla, que es el más nuevo) y deja la hoja
// anterior como respaldo. Se puede volver a ejecutar: no duplica años.
function unificarLibros() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const datos = JSON.parse(DriveApp.getFileById(ID_HISTORICO).getBlob().getDataAsString("UTF-8"));
  const aFecha = v => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? new Date(v + "T12:00:00") : v;

  // 1. un año por hoja, tal cual
  Object.keys(datos.anios).sort().forEach(anio => {
    if (ss.getSheetByName(anio)) return;
    const { columnas, filas } = datos.anios[anio];
    const h = ss.insertSheet(anio, ss.getSheets().length);
    h.getRange(1, 1, 1, columnas.length).setValues([columnas])
      .setFontWeight("bold").setBackground("#1E2761").setFontColor("#FFFFFF").setWrap(true);
    if (filas.length) {
      const esFecha = columnas.map(c => /^Fecha|Finaliza/.test(c));
      h.getRange(2, 1, filas.length, columnas.length)
        .setValues(filas.map(f => f.map((v, i) => v === null ? "" : (esFecha[i] ? aFecha(v) : v))));
      columnas.forEach((c, i) => { if (esFecha[i]) h.getRange(2, i + 1, filas.length, 1).setNumberFormat("dd-mm-yyyy"); });
    }
    h.setFrozenRows(1);
  });

  // 2. libro único: 2026 del Excel + lo que ya registró el seguimiento
  const porFolio = {};
  datos.propuestas2026.forEach(p => { porFolio[String(p.Folio)] = Object.assign({}, p); });
  const anterior = ss.getSheetByName(HOJA);
  if (ss.getSheetByName("Propuestas (antes de unificar)")) throw new Error("Los libros ya están unificados.");
  if (anterior) {
    // la hoja de antes siempre tuvo COLUMNAS_ANTIGUAS, aunque configurar() le haya cambiado los títulos
    const enc = COLUMNAS_ANTIGUAS;
    const ultima = anterior.getLastRow();
    const valores = ultima >= 2 ? anterior.getRange(2, 1, ultima - 1, enc.length).getValues() : [];
    valores.forEach(f => {
      const folio = String(f[0]).trim();
      if (!folio) return;
      const p = porFolio[folio] || (porFolio[folio] = { Folio: folio });
      enc.forEach((c, i) => { if (f[i] !== "" && f[i] !== null) p[c] = f[i]; });
    });
    // el respaldo queda como era: sus títulos, sin listas ni colores del formato nuevo
    anterior.getRange(1, 1, 1, anterior.getMaxColumns()).clearContent();
    anterior.getRange(1, 1, 1, enc.length).setValues([enc]);
    anterior.getDataRange().clearDataValidations();
    anterior.clearConditionalFormatRules();
    anterior.setName("Propuestas (antes de unificar)");
  }
  const hoja = ss.insertSheet(HOJA, 0);
  const folios = Object.keys(porFolio).sort((a, b) => (/^\d+$/.test(a) ? 0 : 1) - (/^\d+$/.test(b) ? 0 : 1) || a.localeCompare(b));
  const filas = folios.map(fo => COLUMNAS.map(c => {
    const v = porFolio[fo][c];
    if (v === undefined || v === null) return "";
    return COL_FECHA.indexOf(c) >= 0 ? aFecha(v) : v;
  }));
  if (filas.length) hoja.getRange(2, 1, filas.length, COLUMNAS.length).setValues(filas);
  formatearPropuestas(hoja);

  // 3. resumen por año
  armarResumen(ss);
  const respaldo = ss.getSheetByName("Propuestas (antes de unificar)");
  if (respaldo) ss.setActiveSheet(respaldo), ss.moveActiveSheet(ss.getSheets().length);
  ss.setActiveSheet(hoja);
  return `Listo: ${filas.length} propuestas en "${HOJA}" y ${Object.keys(datos.anios).length} años de historial.`;
}

function armarResumen(ss) {
  let r = ss.getSheetByName("Resumen");
  if (!r) r = ss.insertSheet("Resumen", 1);
  r.clear();
  const filas = [["Año", "Propuestas", "Aceptadas", "Rechazadas", "Pendientes", "% aceptadas"]];
  const hojas = ss.getSheets().map(h => h.getName()).filter(n => /^\d{4}$/.test(n)).sort();
  const fila = (nombre, etiqueta) => {
    const h = ss.getSheetByName(nombre);
    const enc = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
    const e = letraDe(enc.indexOf("Estado") + 1), f = letraDe(Math.max(1, enc.indexOf("Folio") + 1, enc.indexOf("N°") + 1));
    const q = `'${nombre}'!`;
    const n = filas.length + 1;
    filas.push([etiqueta, `=COUNTA(${q}${f}2:${f})`,
      `=COUNTIF(${q}${e}2:${e},"Aceptada")+COUNTIF(${q}${e}2:${e},"Aprobado")+COUNTIF(${q}${e}2:${e},"Ganada")`,
      `=COUNTIF(${q}${e}2:${e},"Rechazada")+COUNTIF(${q}${e}2:${e},"Perdida")`,
      `=B${n}-C${n}-D${n}`, `=IF(B${n}=0,"",C${n}/B${n})`]);
  };
  hojas.forEach(n => fila(n, n));
  fila(HOJA, "2026 en adelante (Propuestas)");
  r.getRange(1, 1, filas.length, filas[0].length).setValues(filas);
  r.getRange(1, 1, 1, filas[0].length).setFontWeight("bold").setBackground("#1E2761").setFontColor("#FFFFFF");
  r.getRange(2, 6, filas.length - 1, 1).setNumberFormat("0%");
  r.setColumnWidth(1, 220);
}

/* ---------- arreglos después de unificar (una vez) ---------- */
// Rev. como "00", fecha de TEK y tildes que llegaron dañadas (�) a la
// planilla antes de unificar, por registros hechos desde la terminal.
function ajustesFinales() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  formatearPropuestas(hoja);
  const col = n => COLUMNAS.indexOf(n) + 1;
  const reemplazos = [["Crist�bal", "Cristóbal"], ["Mu�oz", "Muñoz"], ["m�n.", "mín."],
                      ["MIGRACI�N LIMPIA �", "MIGRACIÓN LIMPIA —"]];
  const rango = hoja.getDataRange();
  const valores = rango.getValues();
  let cambios = 0;
  valores.forEach((f, i) => f.forEach((v, j) => {
    if (typeof v !== "string" || v.indexOf("�") < 0) return;
    let nuevo = v;
    reemplazos.forEach(([a, b]) => { nuevo = nuevo.split(a).join(b); });
    if (nuevo !== v) { hoja.getRange(i + 1, j + 1).setValue(nuevo); cambios++; }
  }));
  // TEK se publicó el 19-10-2026 (no tenía fecha en ninguno de los dos libros)
  const folios = hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues().map(r => String(r[0]).trim());
  const iTek = folios.indexOf("2026031");
  if (iTek >= 0 && !hoja.getRange(iTek + 2, col("Fecha")).getValue()) hoja.getRange(iTek + 2, col("Fecha")).setValue(new Date("2026-10-19T12:00:00"));
  const restantes = hoja.getDataRange().getValues().flat().filter(v => typeof v === "string" && v.indexOf("�") >= 0).length;
  return `Tildes corregidas: ${cambios}. Celdas que siguen con �: ${restantes}.`;
}

/* ---------- próximo folio (lo pide el cotizador) ---------- */
function proximoFolio() {
  const anio = String(new Date().getFullYear());
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  const ultima = hoja.getLastRow();
  let max = 0;
  if (ultima >= 2) {
    hoja.getRange(2, 1, ultima - 1, 1).getValues().forEach(([v]) => {
      const s = String(v).trim();
      if (s.length === 7 && s.indexOf(anio) === 0 && /^\d+$/.test(s)) max = Math.max(max, Number(s.slice(4)));
    });
  }
  return anio + String(max + 1).padStart(3, "0");
}

/* ---------- entrada desde las páginas de propuesta ---------- */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return responder(false, "json inválido"); }
  if (!d || d.token !== TOKEN) return responder(false, "token inválido");
  if (d.accion === "contacto_web") return contactoWeb(d);
  if (!d.folio) return responder(false, "falta folio");

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (d.accion === "apertura") return apertura(d);
    if (d.accion === "aceptar_propuesta") return aceptar(d);
    if (d.accion === "interes") return interes(d);
    if (d.accion === "registrar_propuesta") { filaDe(d); return responder(true, "registrada"); }   // filaDe completa lo que falte
    return responder(false, "acción desconocida");
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === "proximo_folio") {
    if (p.token !== TOKEN) return responder(false, "token inválido");
    return responder(true, proximoFolio());
  }
  return ContentService.createTextOutput("Seguimiento de propuestas Pro-City: activo.");
}

/* ---------- acciones ---------- */
function apertura(d) {
  const { hoja, fila, col } = filaDe(d);
  const ahora = new Date();
  const celdaAperturas = hoja.getRange(fila, col("Aperturas"));
  const aperturas = (Number(celdaAperturas.getValue()) || 0) + 1;
  celdaAperturas.setValue(aperturas);
  if (aperturas === 1) hoja.getRange(fila, col("Primera apertura")).setValue(ahora);
  hoja.getRange(fila, col("Última apertura")).setValue(ahora);
  const celdaEstado = hoja.getRange(fila, col("Estado"));
  if (celdaEstado.getValue() === "Enviada" || celdaEstado.getValue() === "") celdaEstado.setValue("Abierta");

  if (aperturas === 1 && AVISAR_APERTURA) {
    MailApp.sendEmail({
      to: CORREO_AVISOS,
      subject: `👀 ${d.cliente || "El cliente"} abrió la propuesta ${d.folio}`,
      htmlBody: `<p><b>${esc(d.contacto || d.cliente)}</b> abrió la propuesta <b>${esc(d.folio)}</b> (${esc(d.cliente)}) por primera vez.</p>
        <p>Buen momento para hacer seguimiento.</p>
        <p><a href="${esc(d.url)}">Ver la propuesta</a> · <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Ver seguimiento</a></p>`
    });
  }
  return responder(true, "apertura registrada");
}

function aceptar(d) {
  const { hoja, fila, col } = filaDe(d);
  const ahora = new Date();
  hoja.getRange(fila, col("Estado")).setValue("Aceptada");
  hoja.getRange(fila, col("Opción aceptada")).setValue(d.opcion || "");
  hoja.getRange(fila, col("Precio aceptado (UF)")).setValue(d.precio || "");
  hoja.getRange(fila, col("Fecha aceptación")).setValue(ahora);

  MailApp.sendEmail({
    to: CORREO_AVISOS,
    subject: `✅ ${d.cliente} aceptó la propuesta ${d.folio}: ${d.opcion}`,
    htmlBody: `<p><b>${esc(d.cliente)}</b> aceptó la propuesta <b>${esc(d.folio)}</b> (${esc(d.sistema)}).</p>
      <ul>
        <li>Opción: <b>${esc(d.opcion)}</b> · ${esc(d.precio)} UF + IVA</li>
        ${d.docs ? `<li>${esc(d.docs)}</li>` : ""}
        <li>Contacto: ${esc(d.contacto)} · ${esc(d.email)}</li>
        <li>Fecha: ${esc(d.fecha)}</li>
      </ul>
      ${d.email ? "<p>Al cliente le llegó la confirmación con la solicitud de datos de facturación y N° de OC: su respuesta te llega a este correo.</p>" : "<p>La propuesta no tenía correo del cliente: pídele tú los datos de facturación y la OC.</p>"}
      <p><a href="${esc(d.url)}">Ver la propuesta</a> · <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Ver seguimiento</a></p>`
  });

  if (d.email) {
    // Confirmación al cliente + solicitud de datos de facturación (responde a este correo)
    // "Ximena Muñoz y Sandra Carmona" -> "Hola Ximena y Sandra"
    const nombres = String(d.contacto || "").split(/\s+y\s+|,\s*/).map(n => n.trim().split(" ")[0]).filter(Boolean);
    const saludo = nombres.length ? "Hola " + esc(nombres.length > 1 ? nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1] : nombres[0]) : "Hola";
    const precioTxt = /IVA/.test(String(d.precio)) ? String(d.precio) : String(d.precio) + (/UF/.test(String(d.precio)) ? "" : " UF") + " + IVA";
    const filaDato = n => `<tr><td style="padding:6px 10px; border-bottom:1px solid #E2E5EF; font-weight:bold; width:46%">${n}:</td><td style="padding:6px 10px; border-bottom:1px solid #E2E5EF"></td></tr>`;
    MailApp.sendEmail({
      to: d.email,
      replyTo: CORREO_AVISOS,
      name: "Pro-City",
      subject: `¡Bienvenidos! Recibimos la aceptación de la propuesta ${d.folio}`,
      htmlBody: `<div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#222; line-height:1.55; max-width:620px">
        <p>${saludo}, ¡qué buenas noticias!</p>
        <p>Recibimos la aceptación de la propuesta <b>${esc(d.folio)}</b> de <b>${esc(d.cliente)}</b>: estamos muy contentos de partir este proyecto con ustedes.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin:14px 0">
          <tr><td style="background:#EDF0FC; border-left:4px solid #425CC7; padding:12px 16px; font-size:13.5px">
            ✅ <b>${esc(d.opcion)}</b><br>${esc(precioTxt)}
            ${d.docs ? `<br>✅ ${esc(d.docs)}` : ""}
          </td></tr>
        </table>
        <p>Para emitir la factura y coordinar el inicio, ¿nos pueden responder este correo con los siguientes datos?</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:13.5px; margin:6px 0 16px">
          ${["Nombre de fantasía", "Razón social", "RUT empresa", "Giro del SII", "Dirección (con comuna)", "Dirección casa matriz",
             "Encargado/a de facturación", "Correo de facturación", "Teléfono de facturación", "N° de orden de compra (OC)"].map(filaDato).join("")}
        </table>
        <p>Apenas los recibamos, nos ponemos en contacto para agendar el kick-off. La propuesta completa sigue disponible en
          <a href="${esc(d.url)}" style="color:#425CC7">este link</a>.</p>
        <p>¡Muchas gracias!<br><b>Cristóbal Rebolledo Flores</b><br>Pro-City · ${CORREO_AVISOS}</p>
      </div>`
    });
  }
  return responder(true, "aceptación registrada");
}

// El cliente presionó "Me interesa" en un servicio adicional de la propuesta.
function interes(d) {
  const { hoja, fila, col } = filaDe(d);
  const c = col("Interesado en");
  // la columna se agregó después de instalar: si falta el encabezado, se pone
  if (!hoja.getRange(1, c).getValue()) {
    hoja.getRange(1, c).setValue("Interesado en").setFontWeight("bold").setBackground("#1E2761").setFontColor("#FFFFFF");
  }
  const celda = hoja.getRange(fila, c);
  const actuales = String(celda.getValue() || "").split(" · ").filter(Boolean);
  const servicio = String(d.servicio || "").slice(0, 120);
  if (servicio && actuales.indexOf(servicio) < 0) actuales.push(servicio);
  celda.setValue(actuales.join(" · "));

  MailApp.sendEmail({
    to: CORREO_AVISOS,
    subject: `💡 ${d.cliente || "Un cliente"} se interesó en ${servicio} (propuesta ${d.folio})`,
    htmlBody: `<p><b>${esc(d.contacto || d.cliente)}</b> (${esc(d.cliente)}) presionó <b>Me interesa</b> en
      <b>${esc(servicio)}</b> dentro de la propuesta <b>${esc(d.folio)}</b>.</p>
      <p>Contacto: ${esc(d.contacto)} · ${esc(d.email)}</p>
      <p><a href="${esc(d.url)}">Ver la propuesta</a> · <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Ver seguimiento</a></p>`
  });
  return responder(true, "interés registrado");
}

/* ---------- contactos desde los formularios de pro-city.cl ---------- */
const HOJA_CONTACTOS = "Contactos web";
const COLUMNAS_CONTACTOS = [
  "Fecha", "Tipo", "Nombre", "Empresa", "Correo", "Teléfono", "Plan",
  "Trabajadores", "Razones sociales", "Sistema actual", "Plazo",
  "Página", "Revisar (posible bot)", "Estado", "Notas"
];

function contactoWeb(d) {
  const email = String(d.email || "").trim();
  if (email.indexOf("@") < 1) return responder(false, "falta correo");
  const corto = v => String(v == null ? "" : v).slice(0, 200);
  const tipo = d.tipo === "lead_magnet" ? "Descargó las 12 preguntas" : "Pidió propuesta";

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let hoja = ss.getSheetByName(HOJA_CONTACTOS);
    if (!hoja) {
      hoja = ss.insertSheet(HOJA_CONTACTOS);
      hoja.getRange(1, 1, 1, COLUMNAS_CONTACTOS.length).setValues([COLUMNAS_CONTACTOS])
        .setFontWeight("bold").setBackground("#1E2761").setFontColor("#FFFFFF").setWrap(true);
      hoja.setFrozenRows(1);
      hoja.getRange("A:A").setNumberFormat("dd-mm-yyyy hh:mm");
      hoja.getRange(2, COLUMNAS_CONTACTOS.indexOf("Estado") + 1, 1000, 1).setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList(["Nuevo", "Contactado", "Propuesta enviada", "Descartado"], true).build());
    }
    hoja.appendRow([
      new Date(), tipo, corto(d.nombre), corto(d.empresa), corto(email), "'" + corto(d.telefono),
      corto(d.plan_label || d.plan || d.source), corto(d.trabajadores), corto(d.razones_sociales),
      corto(d.sistema_actual), corto(d.plazo), corto(d.page), d.revisar_posible_bot ? "Sí" : "",
      "Nuevo", ""
    ]);
  } finally {
    lock.releaseLock();
  }

  const quien = d.nombre ? `${esc(d.nombre)}${d.empresa ? " (" + esc(d.empresa) + ")" : ""}` : esc(email);
  MailApp.sendEmail({
    to: CORREO_AVISOS,
    replyTo: email,
    subject: d.tipo === "lead_magnet"
      ? `📥 ${email} descargó las 12 preguntas`
      : `🔥 Nuevo contacto web: ${d.empresa || d.nombre || email}${d.plan_label ? " · " + d.plan_label : ""}`,
    htmlBody: `<p><b>${quien}</b> · ${tipo}.</p>
      <ul>
        <li>Correo: ${esc(email)}${d.telefono ? " · Teléfono: " + esc(d.telefono) : ""}</li>
        ${d.plan_label ? `<li>Plan: ${esc(d.plan_label)}</li>` : ""}
        ${d.trabajadores ? `<li>Trabajadores: ${esc(d.trabajadores)} · Razones sociales: ${esc(d.razones_sociales)}</li>` : ""}
        ${d.sistema_actual ? `<li>Sistema actual: ${esc(d.sistema_actual)} · Plazo: ${esc(d.plazo)}</li>` : ""}
        ${d.revisar_posible_bot ? "<li>⚠️ Lo llenó muy rápido: revisa que no sea un robot.</li>" : ""}
      </ul>
      <p>Responde este correo para escribirle directo. <a href="${urlPlanilla()}">Ver todos los contactos</a></p>`
  });
  return responder(true, "contacto registrado");
}

function urlPlanilla() {
  return SpreadsheetApp.getActiveSpreadsheet().getUrl();
}

/* ---------- utilidades ---------- */
// Devuelve la fila del folio; si no existe la crea. En los dos casos completa
// las celdas vacías con lo que traiga el aviso (nunca pisa lo que ya hay:
// lo escrito a mano, como la OC o la factura, se respeta).
function filaDe(d) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  if (!hoja) throw new Error('Falta la hoja "' + HOJA + '": ejecuta configurar()');
  const col = n => COLUMNAS.indexOf(n) + 1;
  const folio = String(d.folio).trim();
  const op = d.opciones || {};
  const datos = Object.assign({
    "Cliente": d.cliente, "Contacto": d.contacto, "Correo": d.email, "Sistema": d.sistema,
    "Opción 1 mes (UF)": op["1"], "Opción 2 meses (UF)": op["2"], "Opción 3 meses (UF)": op["3"],
    "Link": d.url
  }, d.campos || {});   // campos: {columna: valor} que manda el cotizador al publicar

  let fila = -1;
  const ultima = hoja.getLastRow();
  if (ultima >= 2) {
    const i = hoja.getRange(2, 1, ultima - 1, 1).getValues().map(r => String(r[0]).trim()).indexOf(folio);
    if (i >= 0) fila = i + 2;
  }
  if (fila < 0) {
    const nueva = COLUMNAS.map(() => "");
    nueva[col("Folio") - 1] = folio;
    nueva[col("Rev.") - 1] = "00";
    nueva[col("Fecha") - 1] = new Date();
    nueva[col("Estado") - 1] = "Enviada";
    nueva[col("Aperturas") - 1] = 0;
    hoja.appendRow(nueva);
    fila = hoja.getLastRow();
  }
  const actual = hoja.getRange(fila, 1, 1, COLUMNAS.length).getValues()[0];
  Object.keys(datos).forEach(c => {
    const k = col(c);
    const v = datos[c];
    if (k > 0 && v !== undefined && v !== null && v !== "" && (actual[k - 1] === "" || actual[k - 1] === null)) {
      hoja.getRange(fila, k).setValue(v);
    }
  });
  return { hoja, fila, col };
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function responder(ok, mensaje) {
  return ContentService.createTextOutput(JSON.stringify({ ok, mensaje }))
    .setMimeType(ContentService.MimeType.JSON);
}
