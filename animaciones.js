/* ============================================================
   Pro-City · animaciones al hacer scroll
   ------------------------------------------------------------
   Tres efectos, sin librerias externas (IntersectionObserver):

   1. Aparicion de textos y tarjetas al entrar en pantalla.
   2. Los indicadores numericos cuentan desde cero al llegar a ellos.
   3. El bloque de conversion (CTA y selector de plan) se resalta
      cuando queda a la vista, y el boton "Agenda tu diagnostico"
      del header hace un pulso al pasar el primer scroll.

   Reglas importantes:
   - La clase js-anim se agrega al <html> desde aca. El CSS oculta
     los elementos SOLO bajo html.js-anim, asi que sin JavaScript
     la pagina se ve completa. Google indexa el contenido igual.
   - Si el sistema pide menos movimiento (prefers-reduced-motion)
     no se activa nada: ni clase, ni observadores, ni contadores.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;

  var sinSoporte = !('IntersectionObserver' in window);
  var pideQuietud = window.matchMedia &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sinSoporte || pideQuietud) return;

  root.classList.add('js-anim');

  /* ---------- 0. carrusel de logos ----------------------------------- */

  // La cinta de clientes necesita la lista repetida dos veces: la animacion
  // corre media pista, o sea exactamente una tanda, y al reiniciar cae sobre
  // un fotograma identico. El clon va con aria-hidden y alt vacio para que
  // lectores de pantalla y buscadores cuenten cada cliente una sola vez.
  // Si esta funcion no llega a correr (sin JS, sin IntersectionObserver o con
  // prefers-reduced-motion) el CSS deja la cinta quieta y arrastrable a mano.
  var pistas = document.querySelectorAll('.logos-track');
  for (var p = 0; p < pistas.length; p++) {
    var pista = pistas[p];
    if (pista.classList.contains('is-loop')) continue;
    var copia = pista.cloneNode(true).children;   // coleccion viva
    while (copia.length) {
      var clon = copia[0];
      clon.setAttribute('aria-hidden', 'true');
      clon.setAttribute('alt', '');
      pista.appendChild(clon);                    // mueve el nodo a la pista
    }
    pista.classList.add('is-loop');
  }

  /* ---------- 1. aparicion progresiva -------------------------------- */

  // Los textos entran desde la izquierda (la grilla del manual de marca
  // alinea siempre a la izquierda); las tarjetas suben.
  var DESDE_IZQUIERDA = '.sec-head, .sr-head, .svc-group-head, .svc-group > .intro';
  var DESDE_ABAJO = '.svc, .step, .pain-card, .stat, .plan, .tier, .case-grid > div,' +
                    '.faq details, .note, .magnet, .quiz-box, .cmp-wrap, .founder,' +
                    '.two-col > div, .logos-carrusel, .testi, .rating';

  function marcar(selector, direccion) {
    var nodos = document.querySelectorAll(selector);
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el.closest('.hero')) continue;          // el hero se ve de entrada
      if (el.classList.contains('reveal')) continue;
      el.classList.add('reveal', direccion);
    }
  }

  marcar(DESDE_IZQUIERDA, 'from-left');
  marcar(DESDE_ABAJO, 'from-below');

  // Escalonado: las tarjetas hermanas entran una detras de otra.
  var grupos = document.querySelectorAll('.svc-grid, .steps, .pain-grid, .stats, .plans, .tiers, .faq');
  for (var g = 0; g < grupos.length; g++) {
    var hijos = grupos[g].children;
    for (var h = 0; h < hijos.length; h++) {
      if (hijos[h].classList.contains('reveal')) {
        hijos[h].style.transitionDelay = Math.min(h, 4) * 70 + 'ms';
      }
    }
  }

  var observadorReveal = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      observadorReveal.unobserve(e.target);       // una sola vez
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  var aRevelar = document.querySelectorAll('.reveal');
  for (var r = 0; r < aRevelar.length; r++) observadorReveal.observe(aRevelar[r]);

  /* ---------- 2. contadores ------------------------------------------ */

  // Acepta "5", "50+", "80 mil", "95%", "1.284", "98.4%". Conserva el texto
  // que rodea al numero. Un punto seguido de 1 o 2 digitos se interpreta
  // como decimal (ej. "98.4"); seguido de 3 digitos, como separador de
  // miles (ej. "1.284"), igual que el resto de las cifras del sitio.
  function partir(texto) {
    var m = /^(\D*)([\d.]+)(.*)$/.exec(texto.trim());
    if (!m) return null;
    var crudo = m[2];
    var partes = crudo.split('.');
    var esDecimal = partes.length === 2 && partes[1].length > 0 && partes[1].length <= 2;
    var agrupado = !esDecimal && crudo.indexOf('.') !== -1;
    var valor = esDecimal ? parseFloat(crudo) : parseInt(crudo.replace(/\./g, ''), 10);
    if (!isFinite(valor) || valor <= 0) return null;
    return { antes: m[1], valor: valor, despues: m[3], agrupado: agrupado };
  }

  function formatear(n, agrupado) {
    if (!agrupado) return String(n);
    try { return n.toLocaleString('es-CL'); }
    catch (e) { return String(n); }
  }

  function contar(el, dato) {
    var DURACION = 1300;
    var inicio = null;
    var listo = false;

    function finalizar() {
      if (listo) return;
      listo = true;
      el.textContent = dato.antes + formatear(dato.valor, dato.agrupado) + dato.despues;
    }

    // Red de seguridad. requestAnimationFrame se congela cuando la pestana
    // pasa a segundo plano: sin esto el numero se queda a medio camino y
    // muestra un dato falso (por ejemplo 20% donde dice 95%).
    setTimeout(finalizar, DURACION + 400);

    // Si la pestana ya esta oculta, no se anima: se escribe el valor real.
    if (document.hidden) { finalizar(); return; }

    el.textContent = dato.antes + formatear(0, false) + dato.despues;

    function paso(ahora) {
      if (listo) return;
      if (inicio === null) inicio = ahora;
      var t = Math.min((ahora - inicio) / DURACION, 1);
      if (t >= 1) { finalizar(); return; }
      var suave = 1 - Math.pow(1 - t, 3);          // easeOutCubic
      el.textContent = dato.antes +
                       formatear(Math.round(dato.valor * suave), dato.agrupado) +
                       dato.despues;
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  var observadorNumeros = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      observadorNumeros.unobserve(e.target);
      var dato = e.target.__pcDato;
      if (dato) contar(e.target, dato);
    });
  }, { threshold: 0.6 });

  var numeros = document.querySelectorAll('.stat .num, .rating span');
  for (var n = 0; n < numeros.length; n++) {
    var el = numeros[n];
    var dato = partir(el.textContent);
    if (!dato) continue;                           // sin numero: se deja igual
    el.__pcDato = dato;
    // Nada se pone en cero aca a proposito: el valor real escrito en el HTML
    // se mantiene hasta el instante en que empieza el conteo. Si el observador
    // nunca se dispara, el visitante ve la cifra correcta y no un cero.
    observadorNumeros.observe(el);
  }

  /* ---------- 3. resaltado del bloque de conversion ------------------ */

  var observadorVivo = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      e.target.classList.toggle('is-live', e.isIntersecting);
    });
  }, { threshold: 0.35 });

  var bloques = document.querySelectorAll('.cta, .quiz-box');
  for (var b = 0; b < bloques.length; b++) observadorVivo.observe(bloques[b]);

  // Un solo pulso del boton del header al dejar atras el hero.
  var boton = document.querySelector('.nav .btn-primary');
  var hero = document.querySelector('.hero');
  if (boton && hero) {
    var observadorHero = new IntersectionObserver(function (entradas) {
      if (entradas[0].isIntersecting) return;
      boton.classList.add('is-nudge');
      setTimeout(function () { boton.classList.remove('is-nudge'); }, 900);
      observadorHero.disconnect();
    }, { threshold: 0 });
    observadorHero.observe(hero);
  }
})();
