/* ============================================================
   Pro-City · Envío de correos del cotizador
   ------------------------------------------------------------
   Dos correos, disparados desde el cotizador (js/artifact) y desde
   la página web de cada propuesta:

     1. "enviar_propuesta"  — Pro-City → cliente, con el link a la
        propuesta publicada en pro-city.cl/propuestas/{folio}.html.
        Lo dispara una persona, con el botón "Enviar propuesta por
        correo" del cotizador.

     2. "aceptar_propuesta" — dos correos en uno: al cliente (con la
        propuesta en PDF adjunta y la bienvenida + datos de
        facturación) y a Pro-City (aviso interno). Lo dispara solo
        el navegador del cliente, automáticamente, cuando acepta la
        cotización en la página web de la propuesta.

   DESPLIEGUE (una sola vez)
   ------------------------------------------------------------
   1. https://script.google.com/ → Proyecto nuevo → pega este archivo
      completo reemplazando el Code.gs por defecto.
   2. Cambia TOKEN_SECRETO más abajo por una clave tuya (cualquier
      texto largo y difícil de adivinar — evita que cualquiera que
      encuentre la URL pueda mandar correos a tu nombre).
   3. Implementar → Nueva implementación → tipo "Aplicación web".
        - Ejecutar como: tu cuenta (la que va a firmar los correos,
          ej. crebolledo@procity.live).
        - Quién tiene acceso: Cualquier usuario.
   4. Copia la URL que termina en "/exec" y pégala, junto con el
      mismo TOKEN_SECRETO, en las constantes APPS_SCRIPT_URL /
      APPS_SCRIPT_TOKEN del cotizador (en el <script> del artifact).
   5. La primera vez que se dispare un envío real, Google va a pedir
      autorizar el script (permiso para mandar correo en tu nombre).
      Es un paso único.

   Los correos salen desde la cuenta de Google que hizo la
   implementación — MailApp.sendEmail no permite remitentes
   arbitrarios — así que van a llegar firmados por esa cuenta
   (idealmente crebolledo@procity.live o una cuenta compartida del
   equipo).

   EDITAR EL TEXTO DE LOS CORREOS
   ------------------------------------------------------------
   Las tres plantillas de abajo (plantillaPropuestaEnviada,
   plantillaAceptacion, plantillaAvisoInterno) son el único lugar que
   hay que tocar para cambiar el texto. La lógica de envío (doPost
   hacia abajo) no debería necesitar cambios.
   ============================================================ */

const TOKEN_SECRETO = "CAMBIA-ESTA-CLAVE-POR-UNA-TUYA";
const CORREO_INTERNO = "crebolledo@procity.live";

// ---------------------------------------------------------------
// Plantillas — texto editable
// ---------------------------------------------------------------

function plantillaPropuestaEnviada(d) {
  const asunto = `Propuesta comercial Pro-City · ${d.sistema} para ${d.cliente}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; color:#141A2E; max-width:560px; line-height:1.5">
      <p>Hola${d.contacto ? " " + esc(d.contacto) : ""},</p>
      <p>Como conversamos, te dejamos la propuesta comercial para la implementación de
        <strong>${esc(d.sistema)}</strong> en <strong>${esc(d.cliente)}</strong>. En el siguiente
        link está el detalle completo del alcance, la inversión y los próximos pasos:</p>
      <p style="text-align:center; margin:28px 0">
        <a href="${esc(d.url)}" style="background:#E36C09; color:#fff; text-decoration:none;
          padding:14px 26px; border-radius:4px; font-weight:bold; display:inline-block">
          Ver propuesta comercial →
        </a>
      </p>
      <p>Resumen: <strong>${esc(d.precio)} UF</strong>${d.descuento ? " (" + esc(d.descuento) + " de descuento aplicado)" : ""}
        · folio ${esc(d.folio)}.</p>
      <p>Cualquier duda, respóndenos este correo o escríbenos por WhatsApp.</p>
      <p>Saludos,<br>Equipo Pro-City</p>
    </div>`;
  return { asunto, html };
}

function plantillaAceptacion(d) {
  const asunto = `¡Bienvenido a Pro-City! Confirmación de tu propuesta ${d.folio}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; color:#141A2E; max-width:560px; line-height:1.5">
      <p>Hola${d.contacto ? " " + esc(d.contacto) : ""}, ¡qué buenas noticias!</p>
      <p>Quedamos encantados de partir a trabajar con ${esc(d.cliente)}. Adjunta va la copia de la
        propuesta que aceptaste (folio ${esc(d.folio)}, ${esc(d.precio)} UF).</p>
      <p>Vamos a coordinar de inmediato la asignación de un líder de proyecto para partir con la
        implementación. Para dejar todo listo para la primera factura, ¿nos podrías confirmar estos datos?</p>
      <ul>
        <li>Nombre Fantasía:</li>
        <li>Razón social:</li>
        <li>RUT empresa:</li>
        <li>Giro del SII:</li>
        <li>Dirección (con comuna):</li>
        <li>Dirección Casa Matriz:</li>
        <li>Encargado(a) de facturación:</li>
        <li>Mail de facturación:</li>
        <li>Teléfono de facturación:</li>
      </ul>
      <p>¡Muchas gracias!</p>
      <p>Saludos,<br>Equipo Pro-City<br>contacto@procity.live</p>
    </div>`;
  return { asunto, html };
}

function plantillaAvisoInterno(d) {
  const asunto = `✓ ${d.cliente} aceptó la propuesta ${d.folio}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; color:#141A2E; line-height:1.5">
      <p><strong>${esc(d.cliente)}</strong> aceptó la propuesta <strong>${esc(d.folio)}</strong>
        (${esc(d.sistema)}) el ${esc(d.fecha)}.</p>
      <p>Precio: ${esc(d.precio)} UF · Contacto: ${esc(d.contacto)} · Correo: ${esc(d.email)}</p>
      <p>Se le envió copia en PDF y se le pidieron los datos de facturación.</p>
    </div>`;
  return { asunto, html };
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------

function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder(false, "JSON inválido");
  }

  if (datos.token !== TOKEN_SECRETO) {
    return responder(false, "token inválido");
  }

  try {
    if (datos.accion === "enviar_propuesta") return enviarPropuesta(datos);
    if (datos.accion === "aceptar_propuesta") return aceptarPropuesta(datos);
    return responder(false, "acción desconocida");
  } catch (err) {
    return responder(false, String(err));
  }
}

function enviarPropuesta(d) {
  if (!d.email) return responder(false, "falta el correo del cliente");
  const t = plantillaPropuestaEnviada(d);
  MailApp.sendEmail({
    to: d.email,
    replyTo: CORREO_INTERNO,
    subject: t.asunto,
    htmlBody: t.html
  });
  return responder(true, "enviado");
}

function aceptarPropuesta(d) {
  if (!d.email) return responder(false, "falta el correo del cliente");

  const adjuntos = [];
  if (d.pdf_base64) {
    adjuntos.push(Utilities.newBlob(
      Utilities.base64Decode(d.pdf_base64),
      "application/pdf",
      `Propuesta ${d.folio} - ${d.cliente}.pdf`
    ));
  }

  const t = plantillaAceptacion(d);
  MailApp.sendEmail({
    to: d.email,
    replyTo: CORREO_INTERNO,
    subject: t.asunto,
    htmlBody: t.html,
    attachments: adjuntos
  });

  const interno = plantillaAvisoInterno(d);
  MailApp.sendEmail({
    to: CORREO_INTERNO,
    subject: interno.asunto,
    htmlBody: interno.html,
    attachments: adjuntos
  });

  return responder(true, "confirmado");
}

function responder(ok, mensaje) {
  // ContentService siempre responde HTTP 200: el resultado real va en
  // el campo "ok" del JSON, no en el status HTTP.
  return ContentService
    .createTextOutput(JSON.stringify({ ok, mensaje }))
    .setMimeType(ContentService.MimeType.JSON);
}
