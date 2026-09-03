/* ============================================================
   Pro-City · Cotizador de planes (captura de leads)
   ------------------------------------------------------------
   Marco: 5 niveles de consciencia (Eugene Schwartz). Este archivo
   resuelve el nivel 4 ("ya vio los planes, le falta precio/plazo")
   con un modal de dos pasos, mas dos piezas de apoyo en
   planes.html: la barra de conversion (nivel 4/5) y el exit-intent
   (nivel 2, para quien se va sin dejar nada).

   Sin librerias externas. Vanilla JS, mismo estilo que animaciones.js
   (IIFE, 'use strict', var). Se carga con defer en index.html y
   planes.html unicamente.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     0. CONFIGURACION GENERAL
     --------------------------------------------------------- */
  var CALENDAR_URL = 'https://calendar.app.google/4k6nLR3WYzGfWJeJ6';
  var PHONE_INTL = '56937669574'; // del JSON-LD del sitio (+56937669574)
  var WA_BASE = 'https://wa.me/' + PHONE_INTL;

  var LEAD_MAGNET_PDF = 'assets/12-preguntas-implementador.pdf';

  var STEP1_KEY = 'pc_cotizador_step1';
  var EXIT_SHOWN_KEY = 'pc_exit_intent_shown';

  var PLAN_NAMES = {
    'migracion-limpia': 'MIGRACIÓN LIMPIA',
    'migracion-limpia-esencial': 'MIGRACIÓN LIMPIA — Esencial',
    'migracion-limpia-integral': 'MIGRACIÓN LIMPIA — Integral',
    'migracion-limpia-premium': 'MIGRACIÓN LIMPIA — Premium',
    'rescate': 'RESCATE',
    'historicos-al-dia': 'HISTÓRICOS AL DÍA',
    'piloto-automatico': 'PILOTO AUTOMÁTICO',
    'equipo-experto': 'EQUIPO EXPERTO',
    'asistencia-turno': 'Complemento — Asistencia y turno',
    'integracion-contable': 'Complemento — Integración y centralización contable',
    'carga-documentacion': 'Complemento — Carga de documentación en PDF',
    'plantillas-firma-digital': 'Complemento — Plantillas y firma digital',
    'app-autoconsulta': 'Complemento — Lanzamiento de APP de autoconsulta',
    'informes-normativos': 'Complemento — Informes normativos',
    'historicos-adicionales': 'Complemento — Años adicionales de históricos',
    'asesoria-demanda': 'Complemento — Horas de asesoría a demanda'
  };

  /* ---------------------------------------------------------
     1. ANALITICA
     El sitio ya carga gtag.js global en cada pagina (sin GTM, sin
     dataLayer propio mas alla del que crea gtag.js). trackEvent llama
     a gtag si existe; si no, cae a console.log para poder revisar
     los eventos durante el desarrollo sin romper nada.
     --------------------------------------------------------- */
  function trackEvent(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      } else {
        console.log('[trackEvent]', name, params || {});
      }
    } catch (e) {
      console.warn('trackEvent: error al registrar el evento', name, e);
    }
  }

  /* ---------------------------------------------------------
     2. ENVIO DEL LEAD — capa abstraida e intercambiable
     ============================================================
     FORMSPREE_ENDPOINT apunta al formulario real "Cotizador Pro-City"
     (cuenta Formspree de crebolledo@procity.live), configurado para
     enviar cada envio a ese mismo correo. Plan gratuito: 50 envios/mes.
     Si en algun momento hay que cambiar el destino o el formulario,
     se administra en https://formspree.io/forms (proyecto "My First
     Project" -> "Cotizador Pro-City" -> pestaña Settings).
     ============================================================
     Como adaptar submitLead() a otro backend, sin tocar el resto del
     archivo (los llamadores solo esperan una Promise):

       - Netlify Forms: sirve el sitio desde Netlify, agrega un <form
         data-netlify="true" name="cotizador" hidden> estatico en el HTML
         con los mismos campos, y aqui haz:
           return fetch('/', {
             method: 'POST',
             headers: {'Content-Type': 'application/x-www-form-urlencoded'},
             body: new URLSearchParams(Object.assign({'form-name':'cotizador'}, payload)).toString()
           });

       - Google Apps Script (Web App con doPost): publica el script y
         reemplaza FORMSPREE_ENDPOINT por esa URL; el fetch de abajo
         funciona tal cual (POST + JSON), solo cambia el endpoint.

       - Webhook / CRM propio (HubSpot, Pipedrive, un endpoint interno):
         igual que arriba, cambia FORMSPREE_ENDPOINT por tu URL y ajusta
         headers/autenticacion si tu backend la exige.
     --------------------------------------------------------- */
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqpkqavn'; // Cotizador Pro-City -> crebolledo@procity.live

  function submitLead(payload) {
    return fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) { throw new Error('submitLead: respuesta no OK (' + res.status + ')'); }
      return res;
    }).catch(function (err) {
      console.warn('submitLead: el lead NO se envió. Configura FORMSPREE_ENDPOINT en js/cotizador.js (o cambia submitLead para tu backend).', err);
      // No relanzamos el error a proposito: quien llama muestra la
      // pantalla de gracias de todas formas para no dejar al usuario
      // colgado mientras el formulario de verdad no esta conectado.
    });
  }

  /* ---------------------------------------------------------
     3. UTILIDADES COMPARTIDAS (foco, formularios simples)
     --------------------------------------------------------- */
  function getFocusable(container) {
    var nodos = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    var out = [];
    for (var i = 0; i < nodos.length; i++) {
      if (nodos[i].offsetParent !== null) out.push(nodos[i]);
    }
    return out;
  }

  function trapFocus(e, container) {
    if (e.key !== 'Tab') return;
    var focusables = getFocusable(container);
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* Formularios simples de lead magnet (email a cambio del PDF), usados
     en la salida de bajo compromiso de planes.html y en el exit-intent.
     Cualquier <form data-lead-magnet="origen"> en la pagina queda
     conectado automaticamente, sin tener que repetir este bloque. */
  function wireLeadMagnetForms() {
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.matches || !form.matches('[data-lead-magnet]')) return;
      e.preventDefault();

      var emailInput = form.querySelector('input[type="email"]');
      var hp = form.querySelector('input[name="website"]');
      var status = form.parentElement ? form.parentElement.querySelector('[data-lead-magnet-status]') : null;
      var email = emailInput ? emailInput.value.trim() : '';
      var source = form.getAttribute('data-lead-magnet');

      if (hp && hp.value) {
        console.warn('wireLeadMagnetForms: envío bloqueado (honeypot).');
        return;
      }
      if (!email || email.indexOf('@') === -1) {
        if (status) status.textContent = 'Ingresa un correo válido.';
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

      submitLead({ type: 'lead_magnet', source: source, email: email, page: location.pathname, ts: new Date().toISOString() })
        .then(function () {
          trackEvent('lead_magnet_descargado', { source: source });
          if (status) {
            status.innerHTML = 'Listo. <a href="' + LEAD_MAGNET_PDF + '" style="color:var(--blue);text-decoration:underline">Descarga aquí las 12 preguntas →</a>';
          }
          form.reset();
          if (btn) { btn.disabled = true; btn.textContent = 'Enviado ✓'; }
        });
    });
  }

  /* ---------------------------------------------------------
     4. MODAL COTIZADOR (nivel 4 de consciencia)
     --------------------------------------------------------- */
  var overlay = null;
  var currentPlanSlug = '';
  var currentPlanLabel = '';
  var step2ShownTime = 0;
  var lastTrigger = null;

  function modalTemplate() {
    return ''
      + '<div class="cotizador-modal" role="dialog" aria-modal="true" aria-labelledby="cotizadorTitle">'
      + '  <button type="button" class="cotizador-close" id="cotizadorClose" aria-label="Cerrar cotizador">✕</button>'
      + '  <div class="cotizador-head">'
      + '    <span class="kicker" id="cotizadorKicker" style="margin-bottom:6px">Estás cotizando</span>'
      + '    <h3 id="cotizadorTitle">Pro-City</h3>'
      + '    <div class="cotizador-progress"><i id="cotizadorBar"></i></div>'
      + '  </div>'
      + '  <div class="cotizador-body">'
      + '    <form id="cotizadorForm" novalidate>'
      + '      <div class="cotizador-hp" aria-hidden="true">'
      + '        <label for="cotizadorWebsite">No completes este campo</label>'
      + '        <input type="text" id="cotizadorWebsite" name="website" tabindex="-1" autocomplete="off">'
      + '      </div>'
      + '      <input type="hidden" id="cotizadorPlanSlug" name="plan">'
      + '      <input type="hidden" id="cotizadorPlanLabel" name="plan_label">'

      + '      <div class="cotizador-step on" data-step="1">'
      + '        <div class="cotizador-step-label">Paso 1 de 2 — contexto</div>'

      + '        <div class="cotizador-field">'
      + '          <span class="cotizador-q" id="q-trabajadores">¿Cuántos trabajadores procesas?</span>'
      + '          <div class="cotizador-opts" role="radiogroup" aria-labelledby="q-trabajadores">'
      + radioOpt('trabajadores', '1-50', '1-50')
      + radioOpt('trabajadores', '51-200', '51-200')
      + radioOpt('trabajadores', '201-500', '201-500')
      + radioOpt('trabajadores', '501-1500', '501-1.500')
      + radioOpt('trabajadores', '1500+', '+1.500')
      + '          </div>'
      + '        </div>'

      + '        <div class="cotizador-field">'
      + '          <span class="cotizador-q" id="q-razones">¿Cuántas razones sociales?</span>'
      + '          <div class="cotizador-opts" role="radiogroup" aria-labelledby="q-razones">'
      + radioOpt('razones_sociales', '1', '1')
      + radioOpt('razones_sociales', '2-5', '2 a 5')
      + radioOpt('razones_sociales', '5+', 'Más de 5')
      + '          </div>'
      + '        </div>'

      + '        <div class="cotizador-field">'
      + '          <span class="cotizador-q" id="q-sistema">¿En qué sistema estás hoy?</span>'
      + '          <div class="cotizador-opts" role="radiogroup" aria-labelledby="q-sistema">'
      + radioOpt('sistema_actual', 'excel-manual', 'Excel o manual')
      + radioOpt('sistema_actual', 'erp-contable', 'ERP contable (Defontana, Softland, otro)')
      + radioOpt('sistema_actual', 'buk', 'BUK')
      + radioOpt('sistema_actual', 'talana', 'Talana')
      + radioOpt('sistema_actual', 'rex', 'Rex+')
      + radioOpt('sistema_actual', 'adp', 'ADP')
      + radioOpt('sistema_actual', 'otro', 'Otro')
      + '          </div>'
      + '        </div>'

      + '        <div class="cotizador-field">'
      + '          <span class="cotizador-q" id="q-plazo">¿Cuándo necesitas estar operando?</span>'
      + '          <div class="cotizador-opts" role="radiogroup" aria-labelledby="q-plazo">'
      + radioOpt('plazo', 'asap', 'Lo antes posible')
      + radioOpt('plazo', '1-3-meses', 'En 1-3 meses')
      + radioOpt('plazo', '3-6-meses', 'En 3-6 meses')
      + radioOpt('plazo', 'explorando', 'Estoy explorando')
      + '          </div>'
      + '        </div>'

      + '        <div class="cotizador-error" id="cotizadorError1" aria-live="polite"></div>'
      + '        <div class="cotizador-actions"><button type="button" class="btn btn-primary btn-block" id="cotizadorNext">Continuar →</button></div>'
      + '      </div>'

      + '      <div class="cotizador-step" data-step="2">'
      + '        <button type="button" class="cotizador-back" id="cotizadorBack">← Volver</button>'
      + '        <div class="cotizador-step-label">Paso 2 de 2 — tus datos</div>'

      + '        <div class="cotizador-field">'
      + '          <label for="cotizadorNombre">Nombre</label>'
      + '          <input type="text" id="cotizadorNombre" name="nombre" required autocomplete="name">'
      + '        </div>'
      + '        <div class="cotizador-field">'
      + '          <label for="cotizadorEmail">Correo corporativo</label>'
      + '          <input type="email" id="cotizadorEmail" name="email" required autocomplete="email" inputmode="email">'
      + '        </div>'
      + '        <div class="cotizador-field">'
      + '          <label for="cotizadorTelefono">Teléfono / WhatsApp <span class="opt">(opcional)</span></label>'
      + '          <input type="tel" id="cotizadorTelefono" name="telefono" autocomplete="tel" inputmode="tel">'
      + '        </div>'
      + '        <div class="cotizador-field">'
      + '          <label for="cotizadorEmpresa">Empresa</label>'
      + '          <input type="text" id="cotizadorEmpresa" name="empresa" required autocomplete="organization">'
      + '        </div>'
      + '        <div class="cotizador-consent">'
      + '          <input type="checkbox" id="cotizadorConsent" name="consentimiento" required>'
      + '          <label for="cotizadorConsent">Autorizo a Pro-City a contactarme y enviarme contenido sobre normativa laboral y remuneraciones. Puedo darme de baja cuando quiera.</label>'
      + '        </div>'
      + '        <div class="cotizador-error" id="cotizadorError2" aria-live="polite"></div>'
      + '        <div class="cotizador-actions"><button type="submit" class="btn btn-primary btn-block" id="cotizadorSubmit">Recibir mi propuesta →</button></div>'
      + '        <p class="cotizador-micro">Sin costo y sin compromiso. Te llega el alcance, la ruta de hitos con fechas y el precio cerrado en 3 días hábiles. No te vamos a llamar para insistirte.</p>'
      + '      </div>'

      + '      <div class="cotizador-step cotizador-thanks" data-step="3">'
      + '        <div class="cotizador-step-label" style="color:var(--blue)">Listo</div>'
      + '        <h3>Recibimos tu información</h3>'
      + '        <p>Esto es lo que sigue:</p>'
      + '        <ol class="cotizador-next-steps">'
      + '          <li><strong>Hoy:</strong> revisamos lo que nos contaste.</li>'
      + '          <li><strong>En los próximos 3 días hábiles:</strong> te llega la propuesta con alcance, ruta de hitos y precio cerrado.</li>'
      + '          <li><strong>Cuando la revises:</strong> resolvemos dudas y agendamos el kick-off si decides avanzar.</li>'
      + '        </ol>'
      + '        <div class="cotizador-escalera">'
      + '          <p><strong>¿Quieres adelantar 3 días?</strong></p>'
      + '          <div class="cotizador-actions" style="display:flex;flex-direction:row;flex-wrap:wrap;gap:10px;margin-top:0">'
      + '            <a class="btn btn-primary" id="cotizadorCalendarLink" href="' + CALENDAR_URL + '" target="_blank" rel="noopener">Agenda tu diagnóstico ahora →</a>'
      + '            <a class="btn btn-ghost" id="cotizadorWaLink" href="' + WA_BASE + '" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>'
      + '          </div>'
      + '        </div>'
      + '        <div class="cotizador-lead-magnet">'
      + '          <p>Mientras tanto, llévate esto:</p>'
      + '          <a class="btn btn-ghost btn-block" id="cotizadorPdfLink" href="' + LEAD_MAGNET_PDF + '">Descargar: 12 preguntas que deberías hacerle a tu implementador →</a>'
      + '        </div>'
      + '        <button type="button" class="btn btn-block" id="cotizadorCloseThanks" style="margin-top:16px;background:var(--bg);border-color:var(--line)">Cerrar</button>'
      + '      </div>'
      + '    </form>'
      + '  </div>'
      + '</div>';
  }

  function radioOpt(name, value, label) {
    var id = 'cot-' + name + '-' + value.replace(/[^a-z0-9]/gi, '');
    return '<label class="cotizador-opt" for="' + id + '">'
      + '<input type="radio" id="' + id + '" name="' + name + '" value="' + value + '">'
      + '<span>' + label + '</span></label>';
  }

  function readStep1() {
    function val(name) {
      var el = document.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : '';
    }
    return {
      trabajadores: val('trabajadores'),
      razones_sociales: val('razones_sociales'),
      sistema_actual: val('sistema_actual'),
      plazo: val('plazo')
    };
  }

  function saveStep1(data) {
    // Se guarda junto con el plan que se estaba cotizando: si despues se
    // abre el cotizador para OTRO plan, prefillStep1() no debe rellenar
    // respuestas que correspondian a un contexto distinto.
    var conPlan = Object.assign({ plan: currentPlanSlug }, data);
    try { sessionStorage.setItem(STEP1_KEY, JSON.stringify(conPlan)); } catch (e) {}
  }

  function prefillStep1() {
    var raw;
    try { raw = sessionStorage.getItem(STEP1_KEY); } catch (e) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    if (data.plan !== currentPlanSlug) return; // guardado para otro plan: no rellenar
    ['trabajadores', 'razones_sociales', 'sistema_actual', 'plazo'].forEach(function (name) {
      if (!data[name]) return;
      var radios = document.querySelectorAll('input[name="' + name + '"]');
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].value === data[name]) radios[i].checked = true;
      }
    });
  }

  function goStep(n) {
    var steps = document.querySelectorAll('.cotizador-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('on', Number(steps[i].getAttribute('data-step')) === n);
    }
    var bar = document.getElementById('cotizadorBar');
    if (bar) bar.style.width = (n === 1 ? 33 : n === 2 ? 66 : 100) + '%';
  }

  function onStep1Next() {
    var data = readStep1();
    var err = document.getElementById('cotizadorError1');
    if (!data.trabajadores || !data.razones_sociales || !data.sistema_actual || !data.plazo) {
      err.textContent = 'Responde las cuatro preguntas para continuar.';
      return;
    }
    err.textContent = '';
    saveStep1(data);
    trackEvent('cotizador_paso1_completo', {
      plan: currentPlanSlug,
      trabajadores: data.trabajadores,
      razones_sociales: data.razones_sociales,
      sistema_actual: data.sistema_actual,
      plazo: data.plazo
    });
    goStep(2);
    step2ShownTime = Date.now();
    var nombreInput = document.getElementById('cotizadorNombre');
    if (nombreInput) nombreInput.focus();
  }

  function onFormSubmit(e) {
    e.preventDefault();
    var errorEl = document.getElementById('cotizadorError2');
    errorEl.textContent = '';

    var hp = document.getElementById('cotizadorWebsite');
    var esBot = !!(hp && hp.value.trim());
    // Se mide desde que se MUESTRA el paso 2 (no desde que se abre el
    // modal): si el paso 1 llega prellenado de una visita anterior
    // (prefillStep1) o el navegador autocompleta el paso 2, un humano
    // real puede cruzar el modal completo en menos de 3s. Medir solo el
    // tiempo en el paso 2 evita marcar esos casos como sospechosos.
    var elapsed = Date.now() - step2ShownTime;
    var muyRapido = elapsed < 3000;

    var nombre = document.getElementById('cotizadorNombre').value.trim();
    var email = document.getElementById('cotizadorEmail').value.trim();
    var telefono = document.getElementById('cotizadorTelefono').value.trim();
    var empresa = document.getElementById('cotizadorEmpresa').value.trim();
    var consiente = document.getElementById('cotizadorConsent').checked;

    if (!nombre || !email || !empresa || !consiente) {
      errorEl.textContent = 'Completa nombre, correo, empresa y el consentimiento para continuar.';
      return;
    }
    if (email.indexOf('@') === -1) {
      errorEl.textContent = 'Ingresa un correo válido.';
      return;
    }

    var step1Data = readStep1();
    var payload = {
      plan: currentPlanSlug,
      plan_label: currentPlanLabel,
      trabajadores: step1Data.trabajadores,
      razones_sociales: step1Data.razones_sociales,
      sistema_actual: step1Data.sistema_actual,
      plazo: step1Data.plazo,
      nombre: nombre,
      email: email,
      telefono: telefono,
      empresa: empresa,
      consiente: consiente,
      page: location.pathname,
      ts: new Date().toISOString(),
      revisar_posible_bot: muyRapido // señal blanda: se envia igual, no se descarta el lead
    };

    // Solo el honeypot (campo oculto relleno) es señal dura de bot: un
    // usuario real jamas completa un input aria-hidden/tabindex=-1. El
    // heuristico de tiempo es blando (autocompletado o paso 1 prellenado
    // pueden dar falsos positivos) asi que NUNCA descarta el lead solo,
    // para no perder envios reales en silencio.
    if (esBot) {
      console.warn('cotizador: envío bloqueado por antispam (honeypot).', { esBot: esBot });
      try { sessionStorage.removeItem(STEP1_KEY); } catch (ex) {}
      showThanks();
      return;
    }
    if (muyRapido) {
      console.warn('cotizador: envío marcado como posible bot por tiempo, pero se envía igual.', { elapsedMs: elapsed });
    }

    var submitBtn = document.getElementById('cotizadorSubmit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

    submitLead(payload).then(function () {
      // No mandamos datos personales (nombre/email/telefono) a GA4 a
      // proposito: el evento sirve para medir volumen y contexto de
      // negocio, no para almacenar PII en la analitica.
      trackEvent('lead_enviado', {
        plan: currentPlanSlug,
        trabajadores: payload.trabajadores,
        sistema_actual: payload.sistema_actual,
        plazo: payload.plazo
      });
      try { sessionStorage.removeItem(STEP1_KEY); } catch (ex) {}
      showThanks();
    }).finally(function () {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Recibir mi propuesta →'; }
    });
  }

  function showThanks() {
    goStep(3);
    var wa = document.getElementById('cotizadorWaLink');
    var msg = 'Hola, quiero avanzar con la cotización' + (currentPlanLabel ? ' de ' + currentPlanLabel : '') + '.';
    if (wa) wa.href = WA_BASE + '?text=' + encodeURIComponent(msg);
    var heading = document.querySelector('.cotizador-thanks h3');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
  }

  function onModalKeydown(e) {
    if (!overlay || overlay.hidden) return;
    if (e.key === 'Escape') { closeCotizador(); return; }
    var modal = overlay.querySelector('.cotizador-modal');
    if (modal) trapFocus(e, modal);
  }

  function openCotizador(slug, triggerEl) {
    currentPlanSlug = slug || '';
    currentPlanLabel = PLAN_NAMES[currentPlanSlug] || '';

    var form = document.getElementById('cotizadorForm');
    form.reset();
    document.getElementById('cotizadorPlanSlug').value = currentPlanSlug;
    document.getElementById('cotizadorPlanLabel').value = currentPlanLabel;

    var kicker = document.getElementById('cotizadorKicker');
    var title = document.getElementById('cotizadorTitle');
    if (currentPlanLabel) {
      kicker.textContent = 'Estás cotizando';
      title.textContent = currentPlanLabel;
    } else {
      kicker.textContent = 'Cotización rápida';
      title.textContent = 'Cuéntanos qué necesitas';
    }

    goStep(1);
    document.getElementById('cotizadorError1').textContent = '';
    document.getElementById('cotizadorError2').textContent = '';
    prefillStep1();

    step2ShownTime = 0;
    lastTrigger = triggerEl || document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onModalKeydown);
    document.dispatchEvent(new CustomEvent('pc:cotizador-open', { detail: { plan: currentPlanSlug } }));
    trackEvent('cotizador_abierto', { plan: currentPlanSlug || '(sin preseleccionar)' });

    var closeBtn = document.getElementById('cotizadorClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeCotizador() {
    if (!overlay || overlay.hidden) return;
    var data = readStep1();
    if (data.trabajadores || data.razones_sociales || data.sistema_actual || data.plazo) {
      saveStep1(data);
    }
    overlay.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onModalKeydown);
    document.dispatchEvent(new CustomEvent('pc:cotizador-close'));
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  }

  function buildCotizadorModal() {
    overlay = document.createElement('div');
    overlay.className = 'cotizador-overlay';
    overlay.id = 'cotizadorOverlay';
    overlay.hidden = true;
    overlay.innerHTML = modalTemplate();
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCotizador(); });
    document.getElementById('cotizadorClose').addEventListener('click', closeCotizador);
    document.getElementById('cotizadorCloseThanks').addEventListener('click', closeCotizador);
    document.getElementById('cotizadorNext').addEventListener('click', onStep1Next);
    document.getElementById('cotizadorBack').addEventListener('click', function () {
      goStep(1);
      document.getElementById('cotizadorError1').textContent = '';
    });
    document.getElementById('cotizadorForm').addEventListener('submit', onFormSubmit);
    document.getElementById('cotizadorPdfLink').addEventListener('click', function () {
      trackEvent('lead_magnet_descargado', { source: 'cotizador_thanks', plan: currentPlanSlug });
    });

    // Cualquier boton/enlace con la clase js-cotizar abre el modal con el
    // plan que traiga en data-plan (puede ir vacio: cotizacion generica).
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('.js-cotizar');
      if (!trigger) return;
      e.preventDefault();
      openCotizador(trigger.getAttribute('data-plan') || '', trigger);
    });
  }

  /* ---------------------------------------------------------
     5. BARRA DE CONVERSION (solo planes.html)
     Aparece al pasar el primer bloque de planes (los tres niveles
     de Migración Limpia). Se oculta mientras el modal esta abierto.
     --------------------------------------------------------- */
  function initStickyBar() {
    var tiers = document.querySelector('.tiers');
    if (!tiers) return; // esta pieza es solo para planes.html

    var bar = document.createElement('div');
    bar.className = 'pc-sticky-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Barra de conversión rápida');
    bar.innerHTML = ''
      + '<span>¿Ya sabes cuál necesitas?</span>'
      + '<button type="button" class="btn btn-primary btn-sm js-cotizar" data-plan="">Cotiza tu plan</button>'
      + '<a class="btn btn-outline-light btn-sm" href="' + WA_BASE + '?text=' + encodeURIComponent('Hola, quiero cotizar un plan de Pro-City.') + '" target="_blank" rel="noopener">WhatsApp</a>';
    document.body.appendChild(bar);

    var threshold = 0;
    function computeThreshold() {
      var rect = tiers.getBoundingClientRect();
      threshold = rect.bottom + window.scrollY - window.innerHeight * 0.4;
    }
    computeThreshold();
    window.addEventListener('resize', computeThreshold);
    // Recalcula cuando terminan de cargar fuentes/imagenes: si Montserrat
    // llega tarde, el layout puede moverse despues de la medicion inicial
    // y dejar el umbral desactualizado hasta el proximo resize.
    window.addEventListener('load', computeThreshold);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(computeThreshold);
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var show = window.scrollY > threshold;
        bar.classList.toggle('is-visible', show);
        document.body.classList.toggle('pc-sticky-padding', show);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.addEventListener('pc:cotizador-open', function () { bar.classList.add('is-hidden-modal'); });
    document.addEventListener('pc:cotizador-close', function () { bar.classList.remove('is-hidden-modal'); });
  }

  /* ---------------------------------------------------------
     6. EXIT-INTENT (solo planes.html, solo desktop, una vez por sesión)
     --------------------------------------------------------- */
  function initExitIntent() {
    if (!document.querySelector('.tiers')) return; // solo planes.html
    var yaSeMostro;
    try { yaSeMostro = sessionStorage.getItem(EXIT_SHOWN_KEY); } catch (e) { yaSeMostro = null; }
    if (yaSeMostro) return;

    // "Desktop real": puntero fino con hover (mouse), no touch, y ancho de
    // escritorio. Un mouseout de borde superior no significa nada en un
    // celular o tablet, asi que se evita ahi por completo.
    var esDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 768;
    if (!esDesktop) return;

    var disparado = false;
    function onMouseOut(e) {
      if (disparado) return;
      if (e.relatedTarget || e.toElement) return; // el mouse sigue dentro del documento
      if (e.clientY > 0) return; // solo cuando sale por arriba
      disparado = true;
      document.removeEventListener('mouseout', onMouseOut);
      showExitIntent();
    }
    document.addEventListener('mouseout', onMouseOut);
  }

  function showExitIntent() {
    try { sessionStorage.setItem(EXIT_SHOWN_KEY, '1'); } catch (e) {}

    var overlayEl = document.createElement('div');
    overlayEl.className = 'pc-exit-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-labelledby', 'pcExitTitle');
    overlayEl.innerHTML = ''
      + '<div class="pc-exit-modal">'
      + '  <button type="button" class="cotizador-close" id="pcExitClose" aria-label="Cerrar">✕</button>'
      + '  <h3 id="pcExitTitle">Antes de irte: llévate las 12 preguntas que deberías hacerle a tu implementador antes de firmar.</h3>'
      + '  <p>Las mismas que usamos para auditar migraciones que salieron mal. Si tu proveedor no responde bien al menos ocho, tienes un problema en camino.</p>'
      + '  <form data-lead-magnet="exit_intent" novalidate>'
      + '    <label for="pcExitEmail" class="visually-hidden">Tu correo corporativo</label>'
      + '    <div class="form-row">'
      + '      <input type="email" id="pcExitEmail" name="email" placeholder="Tu correo corporativo" required autocomplete="email" inputmode="email">'
      + '      <button class="btn btn-primary" type="submit">Enviármelas</button>'
      + '    </div>'
      + '    <input type="text" name="website" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true">'
      + '  </form>'
      + '  <p aria-live="polite" data-lead-magnet-status style="font-size:.85rem;margin-top:10px"></p>'
      + '</div>';
    document.body.appendChild(overlayEl);

    function close() {
      overlayEl.removeEventListener('keydown', onKeydown);
      overlayEl.parentNode.removeChild(overlayEl);
    }
    function onKeydown(e) {
      if (e.key === 'Escape') { close(); return; }
      trapFocus(e, overlayEl.querySelector('.pc-exit-modal'));
    }
    overlayEl.addEventListener('click', function (e) { if (e.target === overlayEl) close(); });
    document.getElementById('pcExitClose').addEventListener('click', close);
    overlayEl.addEventListener('keydown', onKeydown);

    var firstInput = document.getElementById('pcExitEmail');
    if (firstInput) firstInput.focus();
  }

  /* ---------------------------------------------------------
     7. CLICKS DE CALENDARIO Y WHATSAPP EN TODO EL SITIO
     Un solo listener delegado evita contar dos veces el mismo click
     (uno especifico + uno generico): cualquier link a calendar.app.google
     o a wa.me/api.whatsapp.com dispara el evento correspondiente,
     venga del header, del footer, del boton flotante, del CTA final,
     de la barra sticky, del exit-intent o de la pantalla de gracias
     del cotizador.
     --------------------------------------------------------- */
  function sourceOf(el) {
    if (el.closest('.cotizador-modal')) return 'cotizador_modal';
    if (el.closest('.pc-sticky-bar')) return 'sticky_bar';
    if (el.closest('.pc-exit-modal')) return 'exit_intent';
    if (el.closest('.wa-float')) return 'wa_float';
    if (el.closest('header')) return 'header';
    if (el.closest('.cta')) return 'cta_final';
    return 'other';
  }

  function initGlobalLinkTracking() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('calendar.app.google') !== -1) {
        trackEvent('calendario_click', { href: href, source: sourceOf(a) });
      } else if (href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1) {
        trackEvent('whatsapp_click', { href: href, source: sourceOf(a) });
      }
    });
  }

  /* ---------------------------------------------------------
     8. ARRANQUE
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildCotizadorModal();
    wireLeadMagnetForms();
    initStickyBar();
    initExitIntent();
    initGlobalLinkTracking();
  });
})();
