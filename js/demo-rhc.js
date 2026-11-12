/* ============================================================
   Pro-City · Formulario "Pide una demo de RH Connect"
   ------------------------------------------------------------
   Conecta cualquier <form data-demo-rhc> de la página (lo usan las
   guías de la DT). Igual que js/cotizador.js: el contacto va a la
   planilla "Seguimiento propuestas Pro-City" (hoja Contactos web) con
   Formspree de respaldo; si fallan los dos se avisa con WhatsApp en
   vez de dar las gracias. Mismos campos que el formulario de
   rh-connect.html.
   ============================================================ */
(function () {
  'use strict';
  var SEGUIMIENTO_URL = 'https://script.google.com/macros/s/AKfycbxnCoriormg_AiaYpqfiifZlXCsNZ4HrudCWof23qqCvf2bOm-0PYLyhA4dSblyj8pS/exec';
  var SEGUIMIENTO_TOKEN = 'pc-j-J__ek-Rl8ksIXBxMjPgmvx';
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqpkqavn';
  var WHATSAPP = 'https://api.whatsapp.com/send/?phone=56937669574&amp;text=Hola%2C%20quiero%20conocer%20RH%20Connect.';

  function enviarAPlanilla(datos) {
    return fetch(SEGUIMIENTO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ token: SEGUIMIENTO_TOKEN, accion: 'contacto_web' }, datos))
    }).then(function (res) { return res.json(); }).then(function (r) {
      if (!r || !r.ok) { throw new Error('planilla: ' + (r && r.mensaje)); }
    });
  }
  function enviarAFormspree(datos) {
    return fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    }).then(function (res) { if (!res.ok) { throw new Error('formspree: ' + res.status); } });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('[data-demo-rhc]')) return;
    e.preventDefault();
    var estado = form.parentElement.querySelector('[data-demo-estado]');
    if (form.website && form.website.value) return;   // campo trampa: solo lo llena un robot
    var datos = {
      tipo: 'rh_connect', plan: 'rh-connect', plan_label: 'RH Connect (desde guía DT)',
      nombre: form.nombre.value.trim(), empresa: form.empresa.value.trim(),
      email: form.email.value.trim(), telefono: form.telefono.value.trim(),
      page: location.pathname, ts: new Date().toISOString()
    };
    if (!datos.nombre || !datos.empresa || datos.email.indexOf('@') < 1) {
      estado.textContent = 'Completa tu nombre, empresa y un correo válido.';
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Enviando…';
    enviarAPlanilla(datos).catch(function () { return enviarAFormspree(datos); }).then(function () {
      if (typeof window.gtag === 'function') window.gtag('event', 'lead_enviado', { plan: 'rh-connect', source: 'guia_dt' });
      form.reset();
      btn.textContent = 'Enviado ✓';
      estado.textContent = 'Listo. Te escribiremos dentro de un día hábil para coordinar la demo.';
    }, function () {
      btn.disabled = false; btn.textContent = 'Quiero una demo';
      estado.innerHTML = 'No pudimos enviar tus datos. Intenta de nuevo o escríbenos por <a href="' + WHATSAPP + '" target="_blank" rel="noopener">WhatsApp</a> o a contacto@procity.live.';
    });
  });
})();
