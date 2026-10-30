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
const COLUMNAS = [
  "Folio", "Cliente", "Contacto", "Correo", "Sistema",
  "Opción 1 mes (UF)", "Opción 2 meses (UF)", "Opción 3 meses (UF)",
  "Link", "Estado", "Aperturas", "Primera apertura", "Última apertura",
  "Opción aceptada", "Precio aceptado (UF)", "Fecha aceptación",
  "Próximo seguimiento", "Notas", "Interesado en"
];
const ESTADOS = [
  ["Enviada",        "#E8EAF6"],
  ["Abierta",        "#FFF3CD"],
  ["En seguimiento", "#FFE0B2"],
  ["Aceptada",       "#C8E6C9"],
  ["Ganada",         "#81C784"],
  ["Perdida",        "#F8BBD0"],
  ["Cerrada",        "#E0E0E0"]
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
  hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
    .setFontWeight("bold").setBackground("#1E2761").setFontColor("#FFFFFF").setWrap(true);
  hoja.setFrozenRows(1);
  hoja.setFrozenColumns(2);
  hoja.getRange("A:A").setNumberFormat("@");                 // folio como texto
  hoja.getRange("L:M").setNumberFormat("dd-mm-yyyy hh:mm");
  hoja.getRange("P:P").setNumberFormat("dd-mm-yyyy hh:mm");
  hoja.getRange("Q:Q").setNumberFormat("dd-mm-yyyy");

  const col = n => COLUMNAS.indexOf(n) + 1;
  const rangoEstado = hoja.getRange(2, col("Estado"), 1000, 1);
  rangoEstado.setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS.map(e => e[0]), true).build()
  );
  const filas = hoja.getRange(2, 1, 1000, COLUMNAS.length);
  const letra = String.fromCharCode(64 + col("Estado"));
  hoja.setConditionalFormatRules(ESTADOS.map(([estado, color]) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$${letra}2="${estado}"`)
      .setBackground(color).setRanges([filas]).build()
  ));
  hoja.setColumnWidth(col("Cliente"), 200);
  hoja.setColumnWidth(col("Link"), 260);
  hoja.setColumnWidth(col("Notas"), 300);

  // Propuestas emitidas antes de instalar el seguimiento
  filaDe({
    folio: "2026031", cliente: "TEK CHILE S.A.", contacto: "Romina Valeska Garay Totin",
    email: "rgaray@tek.tech", sistema: "Talana",
    opciones: { "1": "133,2", "2": "181,6", "3": "229,9" },
    url: "https://pro-city.cl/propuestas/2026031.html"
  });
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
    if (d.accion === "registrar_propuesta") { filaDe(d); return responder(true, "registrada"); }
    return responder(false, "acción desconocida");
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
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
// Devuelve la fila del folio; si no existe la crea con los datos que trae el aviso.
function filaDe(d) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  if (!hoja) throw new Error('Falta la hoja "' + HOJA + '": ejecuta configurar()');
  const col = n => COLUMNAS.indexOf(n) + 1;
  const folio = String(d.folio).trim();
  const ultima = hoja.getLastRow();
  if (ultima >= 2) {
    const folios = hoja.getRange(2, 1, ultima - 1, 1).getValues().map(r => String(r[0]).trim());
    const i = folios.indexOf(folio);
    if (i >= 0) return { hoja, fila: i + 2, col };
  }
  const op = d.opciones || {};
  const nueva = COLUMNAS.map(() => "");
  nueva[col("Folio") - 1] = folio;
  nueva[col("Cliente") - 1] = d.cliente || "";
  nueva[col("Contacto") - 1] = d.contacto || "";
  nueva[col("Correo") - 1] = d.email || "";
  nueva[col("Sistema") - 1] = d.sistema || "";
  nueva[col("Opción 1 mes (UF)") - 1] = op["1"] || "";
  nueva[col("Opción 2 meses (UF)") - 1] = op["2"] || "";
  nueva[col("Opción 3 meses (UF)") - 1] = op["3"] || "";
  nueva[col("Link") - 1] = d.url || "";
  nueva[col("Estado") - 1] = "Enviada";
  nueva[col("Aperturas") - 1] = 0;
  hoja.appendRow(nueva);
  return { hoja, fila: hoja.getLastRow(), col };
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function responder(ok, mensaje) {
  return ContentService.createTextOutput(JSON.stringify({ ok, mensaje }))
    .setMimeType(ContentService.MimeType.JSON);
}
