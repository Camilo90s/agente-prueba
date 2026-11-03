/*
 * UX-EduTutor · lógica del tutor
 * ---------------------------------------------------------------
 * Aplicación web sin dependencias, con el sistema de diseño de Orbita.
 * - Enrutador por hash (#/inicio, #/leccion/mapeo/practica, …)
 * - Modelo del estudiante: rastreo bayesiano del conocimiento por principio
 * - Mediación pedagógica: andamiaje (pistas graduadas que se retiran con el
 *   dominio), retroalimentación pedagógica, reflexión y agencia
 * - Estado guardado en este dispositivo (localStorage), exportable por el docente
 */
(function () {
  'use strict';

  var D = window.TUTOR;
  var ICONS = window.ICONS;
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* =========================================================
   * Utilidades
   * ======================================================= */
  function icon(name, cls) {
    return '<span class="ic ' + (cls || '') + '" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg></span>';
  }
  function logo(cls) {
    return '<svg class="logo ' + (cls || '') + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="23" fill="#3a4cca"/>' +
      '<ellipse cx="24" cy="26" rx="19" ry="7" fill="none" stroke="#9fe7dd" stroke-width="2.2" transform="rotate(-18 24 26)"/>' +
      '<path d="M18 11.5v22l5.6-5.2 3.6 7.9 3.6-1.6-3.6-7.8 7.4-.4z" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<circle cx="39" cy="17" r="2.6" fill="#f5b51b"/></svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function palabras(s) { return norm(s).split(/\s+/).filter(Boolean).length; }
  function pct(x) { return Math.round((x || 0) * 100); }
  function sinVeredicto(t) { t = String(t).replace(/^(Correcto|Exacto|Así es)[:.]\s*/, ''); return t.charAt(0).toUpperCase() + t.slice(1); }
  function L(id) { return D.LECCIONES.filter(function (l) { return l.id === id; })[0]; }
  function LETRA(i) { return 'ABCDEFGH'[i]; }
  function fecha(t) { try { return new Date(t).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } }

  /* =========================================================
   * Estado (solo en este dispositivo)
   * ======================================================= */
  var KEY = 'ux-edututor:v1';
  function fresh() {
    var dom = {};
    D.LECCIONES.forEach(function (l) { dom[l.id] = D.BKT.inicial; });
    return {
      ajustes: { texto: 0, contraste: false, velocidad: 1 },
      perfil: null,        // { nombre, producto, tipo, usuarios, descripcion }
      diag: null,          // { resp: [índices], fecha }
      marcoVisto: false,
      dominio: dom,        // { affordances: 0.25, … } probabilidad de dominio
      practica: {},        // { id: { i, hechas: { 0: { ok, intentos, ayudas } } } }
      caso: {},            // { id: { marcadas: [], revisiones, puntaje } }
      aplica: {},          // { id: { campos, rondas, historial, guia, ejemplo, guardado } }
      reflexion: {},       // { id: { texto, semaforo, fecha } }
      completas: {},       // { id: fecha }
      integracion: { resp: [], fecha: null },
      eventos: []          // registro para el docente
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      var s = JSON.parse(raw), f = fresh();
      Object.keys(f).forEach(function (k) { if (s[k] === undefined) s[k] = f[k]; });
      s.ajustes = Object.assign(f.ajustes, s.ajustes || {});
      s.dominio = Object.assign(f.dominio, s.dominio || {});
      return s;
    } catch (e) { return fresh(); }
  }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* almacenamiento no disponible */ } }
  function log(tipo, datos) {
    S.eventos.push(Object.assign({ t: Date.now() }, datos || {}, { tipo: tipo }));
    if (S.eventos.length > 3000) S.eventos = S.eventos.slice(-3000);
    save();
  }

  function applySettings() {
    root.setAttribute('data-texto', String(S.ajustes.texto || 0));
    if (S.ajustes.contraste) root.setAttribute('data-contraste', 'alto'); else root.removeAttribute('data-contraste');
  }
  applySettings();

  /* =========================================================
   * Modelo del estudiante
   * ======================================================= */
  function dom(id) { return S.dominio[id] == null ? D.BKT.inicial : S.dominio[id]; }
  // Actualización bayesiana con una observación (acierto autónomo o no)
  function observar(id, correcto, origen) {
    var P = D.BKT, p = dom(id), post;
    if (correcto) post = p * (1 - P.desliz) / (p * (1 - P.desliz) + (1 - p) * P.adivina);
    else post = p * P.desliz / (p * P.desliz + (1 - p) * (1 - P.adivina));
    S.dominio[id] = post + (1 - post) * P.aprende;
    var h = $('.module-head[data-id="' + id + '"]');
    if (h) { $('.ring', h).outerHTML = ring(dom(id)); $('.nd', h).textContent = 'Dominio estimado · ' + nivelDominio(id).label; }
    log('dominio', { leccion: id, correcto: correcto, origen: origen, antes: Math.round(p * 100) / 100, despues: Math.round(S.dominio[id] * 100) / 100 });
  }
  function nivelDominio(id) {
    var p = dom(id);
    if (p >= D.BKT.dominio) return { k: 'dominado', label: 'Dominado', cls: 'ok' };
    if (p >= 0.6) return { k: 'avanzando', label: 'Avanzando', cls: 'primary' };
    if (p >= 0.4) return { k: 'en-proceso', label: 'En proceso', cls: 'amber' };
    return { k: 'inicial', label: 'Por fortalecer', cls: 'slate' };
  }
  // Andamiaje: el apoyo se retira a medida que crece el dominio
  function apoyo(id) {
    var p = dom(id);
    if (p < 0.45) return { k: 'alto', label: 'alto', texto: 'Puedes pedir ayuda desde el inicio de cada situación.' };
    if (p < 0.75) return { k: 'medio', label: 'medio', texto: 'Intenta primero; si te equivocas, el tutor te ofrecerá ayuda.' };
    return { k: 'bajo', label: 'bajo', texto: 'Ya dominas buena parte del principio: la ayuda aparece solo después de un intento y empieza por pistas ligeras.' };
  }
  function pasos(id) {
    var pr = S.practica[id], c = S.caso[id], a = S.aplica[id];
    var l = L(id);
    return {
      aprende: !!(pr || c || a) || !!S.completas[id],
      practica: !!(pr && Object.keys(pr.hechas || {}).length >= l.quiz.length),
      caso: !!(c && c.revisiones > 0),
      aplica: !!(a && a.guardado)
    };
  }
  function avanceGlobal() {
    var total = D.LECCIONES.length * 3, hecho = 0;
    D.LECCIONES.forEach(function (l) { var p = pasos(l.id); hecho += (p.practica ? 1 : 0) + (p.caso ? 1 : 0) + (p.aplica ? 1 : 0); });
    return hecho / total;
  }
  // Recomendación explicable: qué hacer ahora y por qué
  function recomendacion() {
    if (!S.perfil) return { go: '/producto', icono: 'pencil', small: 'Empieza por', nombre: 'Registrar tu producto', porque: 'Para acompañarte, el tutor necesita saber qué producto educativo estás diseñando.' };
    if (!S.diag) return { go: '/diagnostico', icono: 'clipboard', small: 'Siguiente paso', nombre: 'Diagnóstico inicial', porque: 'Seis situaciones cortas me ayudan a estimar desde dónde partes en cada principio.' };
    if (!S.marcoVisto) return { go: '/marco', icono: 'target', small: 'Antes de las lecciones', nombre: 'Descubribilidad y las dos brechas', porque: 'Es el marco que une los seis principios.' };
    // Repaso: una lección terminada con dominio bajo
    var repaso = D.LECCIONES.filter(function (l) { return S.completas[l.id] && dom(l.id) < 0.5; })[0];
    if (repaso) return { go: '/leccion/' + repaso.id + '/practica', icono: repaso.icono, small: 'Te sugiero repasar', nombre: repaso.termino, id: repaso.id,
      porque: 'Terminaste esta lección, pero tu dominio estimado es ' + pct(dom(repaso.id)) + ' %. Repasar las situaciones puede consolidarlo.' };
    var pend = D.LECCIONES.filter(function (l) { return !S.completas[l.id]; });
    if (pend.length) {
      var l = pend[0], p = pasos(l.id);
      var paso = !p.practica ? (S.practica[l.id] ? 'practica' : 'aprende') : !p.caso ? 'caso' : 'aplica';
      var diagTxt = '';
      if (S.diag) {
        var qi = D.DIAGNOSTICO.map(function (d) { return d.p; }).indexOf(l.id);
        if (qi >= 0) diagTxt = S.diag.resp[qi] === D.DIAGNOSTICO[qi].ok ? ' En el diagnóstico resolviste bien su situación.' : ' En el diagnóstico su situación te generó dudas.';
      }
      return { go: '/leccion/' + l.id + '/' + paso, icono: l.icono, small: S.practica[l.id] ? 'Continúa con' : 'Te recomiendo', nombre: l.n + '. ' + l.termino, id: l.id,
        porque: 'Es el siguiente principio de la ruta y tu dominio estimado es ' + pct(dom(l.id)) + ' %.' + diagTxt };
    }
    return { go: '/integracion', icono: 'award', small: 'Último paso', nombre: 'Integración de tus decisiones', porque: 'Ya trabajaste los seis principios. Ahora argumenta tus decisiones frente a todos.' };
  }

  /* =========================================================
   * Lectura en voz alta (síntesis de voz del navegador)
   * ======================================================= */
  function setSpeaking(on) { var b = $('#speakBtn'); if (b) { b.setAttribute('aria-pressed', String(on)); b.innerHTML = icon(on ? 'stop' : 'volume'); } }
  var Voice = {
    ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    voice: null,
    pick: function () {
      if (!this.ok) return;
      var vs = window.speechSynthesis.getVoices() || [];
      var pref = ['es-CO', 'es-419', 'es-MX', 'es-US', 'es-ES', 'es'];
      for (var i = 0; i < pref.length; i++) {
        var f = vs.filter(function (v) { return (v.lang || '').replace('_', '-').indexOf(pref[i]) === 0; })[0];
        if (f) { this.voice = f; return; }
      }
    },
    speak: function (text) {
      if (!this.ok || !text) { toast('La lectura en voz alta no está disponible en este navegador.'); return; }
      this.stop();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = this.voice ? this.voice.lang : 'es-CO';
      if (this.voice) u.voice = this.voice;
      u.rate = S.ajustes.velocidad === 0 ? 0.8 : 1;
      u.onend = u.onerror = function () { setSpeaking(false); };
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    stop: function () { if (this.ok) window.speechSynthesis.cancel(); setSpeaking(false); }
  };
  if (Voice.ok) { Voice.pick(); window.speechSynthesis.onvoiceschanged = function () { Voice.pick(); }; }

  /* =========================================================
   * Utilidades de interfaz
   * ======================================================= */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function sheet(html, onMount) {
    var ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(ov);
    var close = function () { ov.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    if (onMount) onMount($('.sheet', ov), close);
    var f = $('button, a, textarea', ov); if (f) f.focus();
    return close;
  }
  function confirmSheet(title, text, okLabel) {
    return new Promise(function (resolve) {
      sheet('<h2 class="h2">' + esc(title) + '</h2><p class="lead">' + esc(text) + '</p>' +
        '<div class="btn-row even"><button class="btn outline" data-r="no">Cancelar</button><button class="btn primary" data-r="si">' + esc(okLabel) + '</button></div>',
        function (el, close) {
          $$('[data-r]', el).forEach(function (b) {
            b.addEventListener('click', function () { close(); resolve(b.getAttribute('data-r') === 'si'); });
          });
        });
    });
  }
  function bindGo(el) { $$('[data-go]', el).forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-go')); }); }); }
  function descargar(nombre, contenido, tipo) {
    var blob = new Blob([contenido], { type: tipo || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  // Mensaje del tutor, con valoración opcional (el estudiante retroalimenta al sistema)
  function tutorMsg(html, opts) {
    opts = opts || {};
    return '<div class="tutor-msg ' + (opts.cls || '') + '"><span class="tutor-av" aria-hidden="true">' + logo('xs') + '</span>' +
      '<div class="tutor-body"><span class="tutor-name">Tutor</span>' + html +
      (opts.valorar ? '<div class="rate" data-rate="' + esc(opts.valorar) + '"><span>¿Te sirvió?</span>' +
        '<button class="chip" data-v="1" aria-label="Sí, me sirvió">👍 Sí</button><button class="chip" data-v="0" aria-label="No me sirvió">👎 No</button></div>' : '') +
      '</div></div>';
  }
  function bindRate(el) {
    $$('[data-rate]', el).forEach(function (box) {
      if (box._b) return; box._b = true;
      $$('button', box).forEach(function (b) {
        b.onclick = function () {
          log('valoracion', { ayuda: box.getAttribute('data-rate'), util: b.getAttribute('data-v') === '1', vista: path() });
          box.innerHTML = '<span>Gracias, lo tendré en cuenta.</span>';
        };
      });
    });
  }
  function ring(p, color) {
    var c = 2 * Math.PI * 26, v = Math.max(0, Math.min(1, p));
    return '<div class="ring" role="img" aria-label="Dominio estimado ' + pct(p) + ' por ciento"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="7"/>' +
      '<circle cx="32" cy="32" r="26" fill="none" stroke="' + (color || '#5fe0cf') + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (c * v) + ' ' + c + '"/></svg><span>' + pct(p) + '%</span></div>';
  }

  /* =========================================================
   * Enrutador
   * ======================================================= */
  var current = '/', cleanup = null, currentView = null;
  function path() { var h = (location.hash || '').replace(/^#/, ''); return h || current || '/'; }
  function go(p) {
    current = p;
    try { if (location.hash !== '#' + p) { location.hash = p; return; } } catch (e) { /* sin hash */ }
    render();
  }
  window.addEventListener('hashchange', function () { current = path(); render(); });

  var ROUTES = [
    [/^\/?$/, viewSplash],
    [/^\/inicio$/, viewInicio],
    [/^\/producto$/, viewProducto],
    [/^\/diagnostico$/, viewDiagnostico],
    [/^\/marco$/, viewMarco],
    [/^\/ruta$/, viewRuta],
    [/^\/leccion\/([\w-]+)$/, function (id) { return viewLeccion(id, 'aprende'); }],
    [/^\/leccion\/([\w-]+)\/(aprende|practica|caso|aplica)$/, viewLeccion],
    [/^\/bitacora$/, viewBitacora],
    [/^\/integracion$/, viewIntegracion],
    [/^\/progreso$/, viewProgreso],
    [/^\/(docente|admin)$/, viewDocente],
    [/^\/ayuda$/, viewAyuda]
  ];

  function render() {
    Voice.stop();
    var t = $('#toast'); if (t) t.hidden = true;
    if (cleanup) { try { cleanup(); } catch (e) { /* */ } cleanup = null; }
    var p = path(), v = null;
    for (var i = 0; i < ROUTES.length; i++) {
      var m = p.match(ROUTES[i][0]);
      if (m) { v = ROUTES[i][1].apply(null, m.slice(1)); break; }
    }
    if (!v) { go('/inicio'); return; }
    paintTop(v);
    var main = $('#view');
    main.className = v.nav === false ? 'no-nav' : '';
    main.innerHTML = v.html;
    main.setAttribute('aria-label', v.title || 'UX-EduTutor');
    paintNav(v);
    window.scrollTo(0, 0); main.scrollTop = 0;
    if (v.mount) cleanup = v.mount(main) || null;
    bindRate(main);
    currentView = v;
    var h = $('h1, .h1', main) || $('.topbar strong');
    if (h && document.activeElement && document.activeElement !== document.body) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  function paintTop(v) {
    var top = $('#top');
    var tools = '<div class="tools">' +
      '<button class="icon-btn" id="sizeBtn" aria-label="Tamaño del texto: ' + ['normal', 'grande', 'muy grande'][S.ajustes.texto || 0] + '">Aa</button>' +
      '<button class="icon-btn" id="speakBtn" aria-pressed="false" aria-label="Leer en voz alta">' + icon('volume') + '</button></div>';
    if (v.kind === 'splash') {
      top.className = 'topbar home';
      top.innerHTML = '<div><span class="chip slate">' + icon('book') + 'Norman (2013)</span></div>' + tools;
    } else if (v.kind === 'home') {
      top.className = 'topbar home';
      top.innerHTML = '<div class="brand">' + logo('sm') + 'UX-EduTutor</div>' + tools;
    } else {
      top.className = 'topbar';
      top.innerHTML = '<button class="icon-btn" id="backBtn" aria-label="Volver">' + icon(v.close ? 'close' : 'back') + '</button>' +
        '<div class="title">' + (v.eyebrow ? '<span class="eyebrow">' + esc(v.eyebrow) + '</span>' : '') + '<strong>' + esc(v.title) + '</strong></div>' + tools;
      $('#backBtn').onclick = function () { go(v.back || '/inicio'); };
    }
    $('#sizeBtn').onclick = function () {
      S.ajustes.texto = ((S.ajustes.texto || 0) + 1) % 3; save(); applySettings();
      this.setAttribute('aria-label', 'Tamaño del texto: ' + ['normal', 'grande', 'muy grande'][S.ajustes.texto]);
      toast('Tamaño del texto: ' + ['normal', 'grande', 'muy grande'][S.ajustes.texto]);
    };
    $('#speakBtn').onclick = function () {
      if (this.getAttribute('aria-pressed') === 'true') { Voice.stop(); return; }
      Voice.speak(currentView && currentView.speak ? currentView.speak() : $('#view').innerText);
    };
  }
  function paintNav(v) {
    var nav = $('#nav');
    nav.hidden = v.nav === false;
    $$('a', nav).forEach(function (a) {
      if (a.getAttribute('data-k') === v.navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* =========================================================
   * Vistas
   * ======================================================= */

  /* Portada */
  function viewSplash() {
    return {
      kind: 'splash', title: 'Inicio', nav: false,
      html:
        '<section class="splash">' +
        '<div class="hero-art" aria-hidden="true"><div class="glow"></div>' +
        '<svg class="orbits" viewBox="0 0 300 300"><ellipse cx="150" cy="168" rx="138" ry="56" fill="none" stroke="#9aa6ea" stroke-width="2" stroke-dasharray="7 7" transform="rotate(-14 150 168)"/>' +
        '<ellipse cx="150" cy="160" rx="120" ry="40" fill="none" stroke="#7fd6cb" stroke-width="2.5" transform="rotate(12 150 160)"/>' +
        '<circle cx="270" cy="128" r="7" fill="#f5b51b"/><circle cx="40" cy="214" r="6" fill="#0b8f81"/></svg>' +
        '<div class="hero-principles">' + D.LECCIONES.map(function (l, i) {
          return '<span class="hp hp' + i + ' c-' + l.color + '">' + icon(l.icono) + '</span>';
        }).join('') + '<span class="hp-center">' + logo() + '</span></div></div>' +
        '<div class="logo-row"><h1 class="wordmark">UX-EduTutor</h1></div>' +
        '<p class="lead">Aprende a aplicar los seis principios de diseño de Norman en los productos educativos que construyes</p>' +
        '<div class="actions"><button class="btn primary block" id="startBtn">' + (S.perfil ? 'Continuar' : 'Comenzar') + icon('arrow') + '</button>' +
        '<button class="btn outline block" data-go="/marco">' + icon('help') + '¿De qué trata?</button></div>' +
        '<p class="place">Licenciatura en Informática · Universidad de Córdoba</p>' +
        '</section>',
      mount: function (el) {
        bindGo(el);
        $('#startBtn').onclick = function () { go(S.perfil ? '/inicio' : '/producto'); };
      }
    };
  }

  /* Inicio */
  function viewInicio() {
    var r = recomendacion();
    var av = avanceGlobal();
    var hechas = D.LECCIONES.filter(function (l) { return S.completas[l.id]; }).length;
    var decisiones = D.LECCIONES.filter(function (l) { return S.aplica[l.id] && S.aplica[l.id].guardado; }).length;
    var tiles = [
      ['/ruta', 'layers', 'c-primary', 'Ruta de principios', hechas + ' de 6 lecciones'],
      ['/marco', 'target', 'c-teal', 'El marco', 'Descubribilidad y brechas'],
      ['/bitacora', 'book', 'c-orange', 'Mi bitácora', decisiones === 1 ? '1 decisión' : decisiones + ' decisiones'],
      ['/integracion', 'award', 'c-violet', 'Integración', 'Argumenta tus decisiones'],
      ['/progreso', 'trophy', 'c-amber', 'Mi progreso', 'Dominio por principio'],
      ['/producto', 'pencil', 'c-slate', 'Mi producto', S.perfil ? S.perfil.producto : 'Sin registrar']
    ];
    return {
      kind: 'home', title: 'Inicio', navKey: 'inicio',
      speak: function () { return 'Hola. ' + r.small + ' ' + r.nombre + '. ' + r.porque; },
      html:
        '<h1 class="h1">' + (S.perfil ? '¡Hola, ' + esc(S.perfil.nombre.split(' ')[0]) + '!' : '¡Hola!') + '<br>¿Qué diseñamos hoy?</h1>' +
        '<section class="progress-card" aria-label="Tu avance">' +
        '<div class="row between"><span>Tu avance en la ruta</span><span>' + pct(av) + ' %</span></div>' +
        '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct(av) + '" aria-label="Avance en la ruta"><i style="width:' + Math.max(pct(av), 3) + '%"></i></div>' +
        '<button class="continue" data-go="' + r.go + '"><span class="thumb">' + icon(r.icono) + '</span>' +
        '<span><small>' + esc(r.small) + '</small><strong>' + esc(r.nombre) + '</strong></span>' +
        '<span class="go">' + icon('next') + '</span></button>' +
        '<p class="why">' + icon('info') + '<span><b>¿Por qué?</b> ' + esc(r.porque) + ' <button class="linkish" id="whyBtn">Cómo lo calculo</button></span></p>' +
        '</section>' +
        '<nav class="tiles" aria-label="Secciones">' + tiles.map(function (t) {
          return '<a class="tile" href="#' + t[0] + '"><span class="badge-ic ' + t[2] + '">' + icon(t[1]) + '</span><strong>' + t[3] + '</strong><small>' + esc(t[4]) + '</small></a>';
        }).join('') + '</nav>',
      mount: function (el) { bindGo(el); $('#whyBtn', el).onclick = explicarModelo; }
    };
  }
  function explicarModelo() {
    sheet('<p class="section-label">Transparencia del tutor</p><h2 class="h2">¿Cómo estimo tu dominio?</h2>' +
      '<p>Para cada principio guardo una probabilidad de que ya lo domines. Empieza en ' + pct(D.BKT.inicial) + ' % y el diagnóstico la ajusta.</p>' +
      '<ul class="fb"><li>Si resuelves una situación <b>al primer intento y sin ayuda</b>, la estimación sube.</li>' +
      '<li>Si te equivocas o necesitas ayuda, baja un poco: no es un castigo, me indica que conviene acompañarte más.</li>' +
      '<li>Considero que puedes acertar por azar (' + pct(D.BKT.adivina) + ' %) o equivocarte por descuido (' + pct(D.BKT.desliz) + ' %).</li>' +
      '<li>Con ' + pct(D.BKT.dominio) + ' % o más, el principio aparece como <b>dominado</b> y retiro parte de las ayudas.</li></ul>' +
      '<p class="small muted">Siempre decides tú qué lección abrir: la recomendación es una sugerencia.</p>' +
      '<button class="btn primary block" data-x>Entendido</button>', function (el, close) { $('[data-x]', el).onclick = close; });
  }

  /* Mi producto */
  function viewProducto() {
    var p = S.perfil || { nombre: '', producto: '', tipo: '', usuarios: '', descripcion: '' };
    var tipos = ['Aplicación web', 'Aplicación móvil', 'Plataforma de aprendizaje', 'Simulador', 'Material multimedia interactivo', 'Juego educativo', 'Otro'];
    return {
      title: 'Mi producto', eyebrow: S.perfil ? 'Puedes editarlo cuando quieras' : 'Paso 1 de 2', back: S.perfil ? '/inicio' : '/', navKey: 'inicio', nav: !!S.perfil,
      html:
        tutorMsg('<p>Voy a acompañarte mientras revisas las decisiones de diseño de <b>tu</b> producto. No lo diseñaré por ti: te haré preguntas, te daré referentes y te diré qué observo.</p>') +
        '<form class="card stack" id="pf" autocomplete="off">' +
        field('nombre', 'Tu nombre', p.nombre, 'input', 'Cómo quieres que te llame') +
        field('producto', 'Nombre del producto', p.producto, 'input', 'Por ejemplo: FraccionApp') +
        '<label class="fld"><span>Tipo de producto</span><select name="tipo" required>' + '<option value="">Elige uno</option>' +
        tipos.map(function (t) { return '<option' + (p.tipo === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>' +
        field('usuarios', '¿Quiénes lo usarán?', p.usuarios, 'input', 'Por ejemplo: estudiantes de grado tercero, en tabletas del aula') +
        field('descripcion', '¿Qué propósito formativo tiene?', p.descripcion, 'textarea', 'En dos o tres frases') +
        '<button class="btn primary block" type="submit">' + (S.perfil ? 'Guardar cambios' : 'Seguir al diagnóstico') + icon('arrow') + '</button>' +
        '</form>',
      mount: function (el) {
        $('#pf', el).onsubmit = function (e) {
          e.preventDefault();
          var f = e.target, d = {};
          ['nombre', 'producto', 'tipo', 'usuarios', 'descripcion'].forEach(function (k) { d[k] = (f[k].value || '').trim(); });
          var falta = ['nombre', 'producto', 'tipo', 'usuarios'].filter(function (k) { return !d[k]; });
          if (falta.length) { toast('Completa los campos para que pueda acompañarte.'); f[falta[0]].focus(); return; }
          var nuevo = !S.perfil;
          S.perfil = d; save(); log('perfil', { producto: d.producto, tipoProducto: d.tipo });
          if (nuevo) go('/diagnostico'); else { toast('Producto actualizado.'); go('/inicio'); }
        };
      }
    };
  }
  function field(name, label, val, kind, ph) {
    return '<label class="fld"><span>' + label + '</span>' + (kind === 'textarea'
      ? '<textarea name="' + name + '" placeholder="' + esc(ph) + '">' + esc(val) + '</textarea>'
      : '<input name="' + name + '" value="' + esc(val) + '" placeholder="' + esc(ph) + '">') + '</label>';
  }

  /* Diagnóstico */
  function viewDiagnostico() {
    var i = 0, resp = [], sel = null;
    var Q = D.DIAGNOSTICO;
    return {
      title: 'Diagnóstico inicial', eyebrow: S.perfil ? '6 situaciones' : 'Paso 2 de 2', back: '/inicio', nav: false, close: true,
      html: '<div id="dg" class="stack"></div>',
      mount: function (el) {
        var box = $('#dg', el);
        function paint() {
          if (i >= Q.length) return fin();
          var q = Q[i];
          box.innerHTML =
            (i === 0 ? tutorMsg('<p>Antes de empezar, seis situaciones cortas. No hay calificación: me sirven para saber desde dónde partes. Si no sabes, elige la opción que te parezca más razonable.</p>') : '') +
            '<div class="qhead"><div class="row between small"><b>Situación ' + (i + 1) + ' de ' + Q.length + '</b></div>' +
            '<div class="segments" style="grid-template-columns:repeat(' + Q.length + ',1fr)">' + Q.map(function (_, k) { return '<i class="' + (k <= i ? 'now' : '') + '"></i>'; }).join('') + '</div></div>' +
            '<div class="qcard"><p class="q">' + esc(q.q) + '</p>' +
            '<div class="options text" role="radiogroup">' + q.ops.map(function (o, k) {
              return '<button class="opt" role="radio" aria-checked="' + (sel === k) + '" data-k="' + k + '"><span class="letter">' + LETRA(k) + '</span><span>' + esc(o) + '</span><span class="tick">' + (sel === k ? icon('check') : '') + '</span></button>';
            }).join('') + '</div></div>' +
            '<button class="btn primary block" id="dgNext"' + (sel == null ? ' disabled' : '') + '>' + (i === Q.length - 1 ? 'Ver resultado' : 'Siguiente') + icon('arrow') + '</button>' +
            (i === 0 ? '<button class="btn ghost block" id="dgSkip">Omitir el diagnóstico</button>' : '');
          $$('.opt', box).forEach(function (b) { b.onclick = function () { sel = Number(b.getAttribute('data-k')); paint(); }; });
          $('#dgNext', box).onclick = function () { resp.push(sel); sel = null; i++; paint(); };
          var sk = $('#dgSkip', box);
          if (sk) sk.onclick = function () { S.diag = { resp: [], fecha: Date.now(), omitido: true }; save(); log('diagnostico', { omitido: true }); go('/inicio'); };
        }
        function fin() {
          S.diag = { resp: resp, fecha: Date.now() };
          Q.forEach(function (q, k) { S.dominio[q.p] = resp[k] === q.ok ? 0.5 : 0.15; });
          save(); log('diagnostico', { aciertos: Q.filter(function (q, k) { return resp[k] === q.ok; }).length, resp: resp });
          var ok = Q.filter(function (q, k) { return resp[k] === q.ok; });
          box.innerHTML =
            tutorMsg('<p>Resolviste bien <b>' + ok.length + ' de ' + Q.length + '</b> situaciones. Con esto ajusté mi estimación inicial de cada principio.</p>' +
              (ok.length < Q.length ? '<p>Las situaciones que te generaron dudas me indican dónde acompañarte con más pistas al comienzo.</p>' : '<p>Partes con buena base: en las prácticas te daré menos ayudas al inicio.</p>')) +
            '<section class="card stack">' + Q.map(function (q, k) {
              var bien = resp[k] === q.ok, l = L(q.p);
              return '<div class="mod-progress"><span>' + l.n + '. ' + esc(l.termino) + '</span><span class="' + (bien ? 'ok-text' : 'bad-text') + '">' + (bien ? 'Bien' : 'Por fortalecer') + '</span><div class="bar"><i style="width:' + pct(dom(q.p)) + '%"></i></div></div>';
            }).join('') + '</section>' +
            '<p class="small muted">Las barras muestran el dominio estimado con el que empiezas cada lección.</p>' +
            '<button class="btn primary block" data-go="/marco">Conocer el marco de los seis principios' + icon('arrow') + '</button>';
          bindGo(box);
        }
        paint();
      }
    };
  }

  /* Marco: descubribilidad, comprensión y las dos brechas */
  function viewMarco() {
    var M = D.MARCO;
    var ej = D.LECCIONES.filter(function (l) { return l.brecha === 'ejecución'; });
    return {
      title: 'El marco', eyebrow: 'Antes de las lecciones', back: '/inicio', navKey: 'ruta',
      html:
        '<h1 class="h1">Descubrir y comprender</h1>' +
        '<p class="lead">' + esc(M.idea) + '</p>' +
        '<div class="duo"><div class="card flat"><span class="chip primary">' + icon('target') + 'Descubribilidad</span><p>' + esc(M.descubribilidad) + '</p></div>' +
        '<div class="card flat"><span class="chip teal">' + icon('bulb') + 'Comprensión</span><p>' + esc(M.comprension) + '</p></div></div>' +
        '<section class="card stack"><h2 class="h3">Las dos brechas</h2>' + gulfSVG() +
        '<p><b class="primary-text">Brecha de ejecución.</b> ' + esc(M.ejecucion.replace('La brecha de ejecución separa', 'Separa')) + ' La ayudan a salvar: ' + ej.map(function (l) { return l.termino.toLowerCase(); }).join(', ') + '.</p>' +
        '<p><b class="teal-text">Brecha de evaluación.</b> ' + esc(M.evaluacion.replace('La brecha de evaluación separa', 'Separa')) + ' La ayuda a salvar la retroalimentación.</p>' +
        '<p><b class="amber-text">El modelo conceptual</b> atraviesa ambas: ayuda a planear qué hacer y a interpretar lo que pasó.</p></section>' +
        '<section class="stack"><p class="section-label">Los seis principios</p><div class="list">' + D.LECCIONES.map(itemLeccion).join('') + '</div></section>' +
        '<button class="btn primary block" id="mkGo">Ir a la ruta' + icon('arrow') + '</button>',
      mount: function (el) {
        bindGo(el);
        $('#mkGo', el).onclick = function () { S.marcoVisto = true; save(); go('/ruta'); };
        if (!S.marcoVisto) { S.marcoVisto = true; save(); log('marco', {}); }
      }
    };
  }
  function gulfSVG() {
    return '<svg class="gulf" viewBox="0 0 340 170" role="img" aria-label="Diagrama: la persona cruza la brecha de ejecución hacia el producto y la brecha de evaluación de regreso">' +
      '<rect x="8" y="50" width="86" height="70" rx="16" fill="var(--primary-soft)"/><text x="51" y="80" text-anchor="middle" class="g-t">Persona</text><text x="51" y="98" text-anchor="middle" class="g-s">metas</text>' +
      '<rect x="246" y="50" width="86" height="70" rx="16" fill="var(--teal-soft)"/><text x="289" y="80" text-anchor="middle" class="g-t">Producto</text><text x="289" y="98" text-anchor="middle" class="g-s">estado</text>' +
      '<path d="M100 62 C150 18 190 18 240 62" fill="none" stroke="var(--primary)" stroke-width="3" marker-end="url(#ga)"/>' +
      '<path d="M240 108 C190 152 150 152 100 108" fill="none" stroke="var(--teal)" stroke-width="3" marker-end="url(#gb)"/>' +
      '<defs><marker id="ga" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--primary)"/></marker>' +
      '<marker id="gb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--teal)"/></marker></defs>' +
      '<text x="170" y="22" text-anchor="middle" class="g-t g-p">Ejecución · ¿cómo lo hago?</text>' +
      '<text x="170" y="160" text-anchor="middle" class="g-t g-tl">Evaluación · ¿qué pasó?</text>' +
      '<text x="170" y="90" text-anchor="middle" class="g-s">modelo conceptual</text></svg>';
  }

  /* Ruta de principios */
  function itemLeccion(l) {
    var nd = nivelDominio(l.id), done = !!S.completas[l.id];
    var r = recomendacion();
    var reco = r.id === l.id;
    return '<a class="item' + (reco ? ' current' : '') + '" href="#/leccion/' + l.id + '">' +
      '<span class="thumb c-' + l.color + '">' + icon(l.icono) + '</span>' +
      '<span><strong>' + l.n + '. ' + esc(l.termino) + '</strong><small>' + (reco ? 'Recomendada · ' : '') + 'Dominio ' + pct(dom(l.id)) + ' % · ' + nd.label + '</small></span>' +
      (done ? '<span class="state done" aria-label="Lección terminada">' + icon('check') + '</span>' : '<span class="go">' + icon('next') + '</span>') + '</a>';
  }
  function viewRuta() {
    var hechas = D.LECCIONES.filter(function (l) { return S.completas[l.id]; }).length;
    return {
      title: 'Ruta de principios', back: '/inicio', navKey: 'ruta',
      html:
        '<div class="module-head"><div><small>Criterios UX · Norman (2013)</small><h2>Seis principios fundamentales de la interacción</h2><small>' + hechas + ' de 6 lecciones terminadas</small></div>' + ring(hechas / 6) + '</div>' +
        '<div class="goal">' + icon('target') + '<span>En cada lección: <b>aprende</b> el principio, <b>practica</b> con situaciones, <b>analiza</b> un caso y <b>aplícalo</b> a tu producto.</span></div>' +
        '<a class="item" href="#/marco"><span class="thumb c-slate">' + icon('target') + '</span><span><strong>El marco</strong><small>Descubribilidad, comprensión y las dos brechas</small></span>' + (S.marcoVisto ? '<span class="state done">' + icon('check') + '</span>' : '<span class="state new">Empieza aquí</span>') + '</a>' +
        '<div class="list">' + D.LECCIONES.map(itemLeccion).join('') + '</div>' +
        '<a class="item" href="#/integracion"><span class="thumb c-violet">' + icon('award') + '</span><span><strong>Integración</strong><small>Consolida y argumenta tus decisiones</small></span><span class="go">' + icon('next') + '</span></a>' +
        '<p class="small muted">Tú eliges el orden. El tutor marca en azul la lección que te recomienda.</p>'
    };
  }

  /* Lección */
  var PASOS = [['aprende', 'Aprende', 'book'], ['practica', 'Practica', 'puzzle'], ['caso', 'Analiza', 'zoom'], ['aplica', 'Aplica', 'pencil']];
  function viewLeccion(id, paso) {
    var l = L(id);
    if (!l) return null;
    var pz = pasos(id);
    var head =
      '<div class="module-head c-head-' + l.color + '" data-id="' + id + '"><div><small>Principio ' + l.n + ' de 6 · ' + esc(l.en) + '</small><h2>' + esc(l.termino) + '</h2><small class="nd">Dominio estimado · ' + nivelDominio(id).label + '</small></div>' + ring(dom(id)) + '</div>' +
      '<nav class="steps" aria-label="Pasos de la lección">' + PASOS.map(function (p, k) {
        return '<a href="#/leccion/' + id + '/' + p[0] + '"' + (p[0] === paso ? ' aria-current="step"' : '') + '><span class="sn">' + (pz[p[0]] && p[0] !== paso ? icon('check') : k + 1) + '</span>' + p[1] + '</a>';
      }).join('') + '</nav>';
    var v = ({ aprende: pasoAprende, practica: pasoPractica, caso: pasoCaso, aplica: pasoAplica })[paso](l);
    if (!S.practica[id] && paso === 'aprende') log('abrir', { leccion: id });
    return {
      title: l.termino, eyebrow: 'Lección ' + l.n + ' · ' + PASOS.filter(function (p) { return p[0] === paso; })[0][1], back: '/ruta', navKey: 'ruta',
      speak: v.speak, html: head + v.html, mount: v.mount
    };
  }

  function pasoAprende(l) {
    return {
      speak: function () { return l.termino + '. ' + l.def + ' ' + l.explica.join(' '); },
      html:
        '<section class="def-card"><p class="section-label">Definición</p><p class="def">' + esc(l.def) + '</p><p class="src">' + icon('book') + esc(l.fuente) + '</p></section>' +
        '<div class="goal">' + icon('bulb') + '<span><b>Idea clave.</b> ' + esc(l.clave) + '</span></div>' +
        '<section class="card stack">' + l.explica.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        '<p class="small"><span class="chip ' + (l.brecha === 'evaluación' ? 'teal' : l.brecha === 'ambas' ? 'amber' : 'primary') + '">' + icon('split') + 'Brecha de ' + (l.brecha === 'ambas' ? 'ejecución y evaluación' : l.brecha) + '</span></p></section>' +
        '<section class="stack"><p class="section-label">Matices del principio</p>' + l.matices.map(function (m) {
          return '<details class="card"><summary><strong>' + esc(m.t) + '</strong></summary><p>' + esc(m.d) + '</p></details>';
        }).join('') + '</section>' +
        '<section class="duo"><div class="card flat"><span class="chip slate">' + icon('home') + 'Objeto cotidiano</span><p>' + esc(l.cotidiano) + '</p></div>' +
        '<div class="card flat"><span class="chip primary">' + icon('grid') + 'Producto educativo</span><p>' + esc(l.producto) + '</p></div></section>' +
        '<div class="feedback bad">' + icon('xCircle') + '<div><b>Confusión frecuente</b><p>' + esc(l.confusion) + '</p></div></div>' +
        tutorMsg('<p>Antes de practicar, piensa: <b>¿dónde has visto este principio fallar en algo que usas a diario?</b> No necesitas escribirlo; tenlo presente en las situaciones.</p>') +
        '<button class="btn primary block" data-go="/leccion/' + l.id + '/practica">Practicar con situaciones' + icon('arrow') + '</button>',
      mount: bindGo
    };
  }

  function pasoPractica(l) {
    var id = l.id;
    var st = S.practica[id] || (S.practica[id] = { i: 0, hechas: {} });
    var q = null, sel = null, tried = [], nivel = 0, descartada = null, primera = true, done = false, inicio = Date.now();
    return {
      speak: function () { return q ? q.q + ' ' + q.ops.map(function (o, k) { return 'Opción ' + LETRA(k) + ': ' + o[0]; }).join('. ') : ''; },
      html: '<div id="pr" class="stack"></div>',
      mount: function (el) {
        var box = $('#pr', el);
        function nuevo() { q = l.quiz[st.i]; sel = null; tried = []; nivel = 0; descartada = null; primera = true; done = false; inicio = Date.now(); }
        function puedeAyuda() {
          var a = apoyo(id).k;
          if (done) return false;
          if (nivel >= 4) return false;
          if (a === 'alto') return true;
          if (!tried.length) return false;
          if (a === 'bajo' && nivel >= 2 && tried.length < 2) return false;
          return true;
        }
        function paint() {
          if (st.i >= l.quiz.length) return resumen();
          if (!q) nuevo();
          var ap = apoyo(id);
          var ayudas = '';
          if (nivel >= 1) ayudas += '<div class="hint-line">' + icon('help') + '<span><b>Pregunta orientadora.</b> ' + esc(q.pista) + '</span></div>';
          if (nivel >= 2) ayudas += '<div class="hint-line">' + icon('book') + '<span><b>Recuerda el principio.</b> ' + esc(l.def) + '</span></div>';
          if (nivel >= 3) ayudas += '<div class="hint-line">' + icon('x') + '<span><b>Descarté una opción.</b> La opción ' + LETRA(descartada) + ' no es la respuesta: ' + esc(q.ops[descartada][1]) + '</span></div>';
          if (nivel >= 4) ayudas += '<div class="hint-line">' + icon('bulb') + '<span><b>Explicación del paso.</b> La respuesta es la opción ' + LETRA(q.ok) + '. ' + esc(sinVeredicto(q.ops[q.ok][1])) + ' Selecciónala para continuar.</span></div>';
          var ultimaMal = tried.length && !done ? tried[tried.length - 1] : null;
          box.innerHTML =
            '<div class="qhead"><div class="row between small"><b>Situación ' + (st.i + 1) + ' de ' + l.quiz.length + '</b><span class="chip slate" title="' + esc(ap.texto) + '">Apoyo ' + ap.label + '</span></div>' +
            '<div class="segments" style="grid-template-columns:repeat(' + l.quiz.length + ',1fr)">' + l.quiz.map(function (_, k) {
              var h = st.hechas[k]; return '<i class="' + (k === st.i ? 'now' : h ? (h.ok && !h.ayudas && h.intentos === 1 ? 'ok' : 'bad') : '') + '"></i>';
            }).join('') + '</div></div>' +
            '<div class="qcard"><p class="q">' + esc(q.q) + '</p>' +
            '<div class="options text" role="radiogroup">' + q.ops.map(function (o, k) {
              var off = tried.indexOf(k) >= 0 || k === descartada;
              var cls = done && k === q.ok ? ' is-ok' : off ? ' is-bad' : '';
              return '<button class="opt' + cls + '" role="radio" aria-checked="' + (sel === k) + '" data-k="' + k + '"' + (off || done ? ' disabled' : '') + '><span class="letter">' + LETRA(k) + '</span><span>' + esc(o[0]) + '</span><span class="tick">' + (sel === k || (done && k === q.ok) ? icon('check') : '') + '</span></button>';
            }).join('') + '</div></div>' +
            (ultimaMal != null ? tutorMsg('<p><b>No es esa.</b> ' + esc(q.ops[ultimaMal][1]) + '</p><p>' + (tried.length === 1 ? '¿Qué te hizo elegirla? Vuelve a leer la situación y piensa en lo que define al principio.' : 'Vamos paso a paso: usa la ayuda si la necesitas.') + '</p>', { cls: 'warn' }) : '') +
            (ayudas ? '<div class="hints">' + ayudas + '</div>' : '') +
            (nivel > 0 && !done ? '<div class="rate-wrap">' + tutorMsg('', { valorar: id + ':q' + st.i + ':n' + nivel, cls: 'tm-mini' }) + '</div>' : '') +
            (done ? tutorMsg('<p><b>' + (tried.length || nivel ? '¡Lo lograste!' : '¡Muy bien, al primer intento!') + '</b> ' + esc(q.ops[q.ok][1]) + '</p>', { cls: 'ok' }) : '') +
            '<div class="btn-row' + (done ? ' one' : '') + '">' +
            (done ? '' : '<button class="btn outline" id="helpBtn"' + (puedeAyuda() ? '' : ' disabled') + '>' + icon('help') + (nivel ? 'Más ayuda' : 'Pedir ayuda') + '</button>') +
            (done ? '<button class="btn primary block" id="nextBtn">' + (st.i === l.quiz.length - 1 ? 'Ver resumen' : 'Siguiente situación') + icon('arrow') + '</button>'
                  : '<button class="btn primary" id="checkBtn"' + (sel == null ? ' disabled' : '') + '>Comprobar</button>') + '</div>' +
            (!done && !puedeAyuda() && nivel < 4 ? '<p class="small muted center">' + esc(ap.texto) + '</p>' : '');
          $$('.opt', box).forEach(function (b) { b.onclick = function () { sel = Number(b.getAttribute('data-k')); paint(); }; });
          var hb = $('#helpBtn', box);
          if (hb) hb.onclick = function () {
            nivel++;
            if (nivel === 3) {
              var wrong = q.ops.map(function (_, k) { return k; }).filter(function (k) { return k !== q.ok && tried.indexOf(k) < 0; });
              descartada = wrong.length ? wrong[0] : null;
              if (descartada == null) nivel = 4;
              if (sel === descartada) sel = null;
            }
            log('ayuda', { leccion: id, q: st.i, nivel: nivel, ayuda: D.AYUDAS[nivel - 1].id });
            paint();
          };
          var cb = $('#checkBtn', box);
          if (cb) cb.onclick = comprobar;
          var nb = $('#nextBtn', box);
          if (nb) nb.onclick = function () { st.i++; q = null; save(); paint(); };
          bindRate(box);
        }
        function comprobar() {
          var bien = sel === q.ok;
          if (primera) { observar(id, bien && nivel === 0, 'practica'); primera = false; }
          log('respuesta', { leccion: id, q: st.i, op: sel, correcta: bien, intento: tried.length + 1, ayudas: nivel, texto: q.ops[sel][0], ms: Date.now() - inicio });
          if (bien) {
            done = true;
            st.hechas[st.i] = { ok: true, intentos: tried.length + 1, ayudas: nivel };
            save();
          } else { tried.push(sel); sel = null; }
          paint();
        }
        function resumen() {
          var hs = l.quiz.map(function (_, k) { return st.hechas[k] || {}; });
          var solos = hs.filter(function (h) { return h.ok && !h.ayudas && h.intentos === 1; }).length;
          var conAyuda = hs.filter(function (h) { return h.ayudas; }).length;
          box.innerHTML =
            tutorMsg('<p>Resolviste las ' + l.quiz.length + ' situaciones: <b>' + solos + ' al primer intento y sin ayuda</b>' + (conAyuda ? ', y en ' + conAyuda + ' usaste ayudas' : '') + '.</p>' +
              '<p>' + (solos === l.quiz.length ? 'Reconoces bien el principio en situaciones nuevas. Veamos si lo detectas en una pantalla real.' :
              'Las situaciones en las que te equivocaste son normales al comenzar. En el caso podrás comprobar si ya distingues el principio en una pantalla.') + '</p>', { cls: 'ok' }) +
            '<div class="qdots" style="grid-template-columns:repeat(' + l.quiz.length + ',1fr)">' + hs.map(function (h, k) {
              var a = h.ok && !h.ayudas && h.intentos === 1;
              return '<span><i class="' + (a ? 'ok' : 'bad') + '">' + icon(a ? 'check' : 'help') + '</i>S' + (k + 1) + '</span>';
            }).join('') + '</div>' +
            '<button class="btn primary block" data-go="/leccion/' + id + '/caso">Analizar un caso' + icon('arrow') + '</button>' +
            '<button class="btn ghost block" id="again">Repetir las situaciones</button>';
          bindGo(box);
          $('#again', box).onclick = function () { st.i = 0; st.hechas = {}; q = null; save(); log('repetir', { leccion: id }); paint(); };
        }
        paint();
      }
    };
  }

  function pasoCaso(l) {
    var id = l.id, C = l.caso;
    var st = S.caso[id] || (S.caso[id] = { marcadas: [], revisiones: 0, puntaje: null });
    var marcadas = (st.revisada ? st.marcadas : st.marcadas).slice(), revisado = !!st.revisada;
    return {
      speak: function () { return C.titulo + '. ' + C.contexto; },
      html: '<div id="cs" class="stack"></div>',
      mount: function (el) {
        var box = $('#cs', el);
        function paint() {
          var probs = C.zonas.filter(function (z) { return z.problema; });
          var res = null;
          if (revisado) {
            var hits = probs.filter(function (z) { return marcadas.indexOf(z.id) >= 0; }).length;
            var falsas = C.zonas.filter(function (z) { return !z.problema && marcadas.indexOf(z.id) >= 0; }).length;
            res = { hits: hits, falsas: falsas, total: probs.length };
          }
          box.innerHTML =
            '<section class="card stack"><p class="section-label">Caso</p><h2 class="h2">' + esc(C.titulo) + '</h2><p>' + esc(C.contexto) + '</p>' +
            '<p class="small muted">' + icon('hand') + ' Toca un elemento para marcarlo; tócalo otra vez para desmarcarlo.</p></section>' +
            '<div class="mock" role="group" aria-label="Pantalla del producto"><div class="mock-bar"><span>‹</span><b>' + esc(C.pantalla) + '</b><span>⋯</span></div>' +
            C.zonas.map(function (z, k) {
              var m = marcadas.indexOf(z.id) >= 0, cls = '';
              if (revisado) cls = z.problema ? (m ? ' z-hit' : ' z-miss') : (m ? ' z-false' : ' z-ok');
              return '<button class="zone' + cls + '" data-z="' + z.id + '" aria-pressed="' + m + '"' + (revisado ? ' disabled' : '') + '><span class="zn">' + (k + 1) + '</span>' + z.html +
                (revisado ? '<span class="zfb">' + (z.problema ? (m ? '✓ Problema detectado' : '! Problema sin marcar') : (m ? '× Este estaba bien' : '✓ Bien sin marcar')) + '</span>' : '') + '</button>';
            }).join('') + '</div>' +
            (revisado ? tutorMsg('<p>Detectaste <b>' + res.hits + ' de ' + res.total + '</b> problemas' + (res.falsas ? ' y marcaste ' + res.falsas + ' elemento' + (res.falsas > 1 ? 's' : '') + ' que estaba' + (res.falsas > 1 ? 'n' : '') + ' bien' : '') + '.</p>' +
                (res.hits === res.total && !res.falsas ? '<p>Análisis preciso. Ya distingues este principio en una pantalla real.</p>' : '<p>Lee la explicación de cada elemento: los que se te escaparon muestran qué mirar la próxima vez.</p>'), { cls: res.hits === res.total && !res.falsas ? 'ok' : 'warn' }) +
              '<ol class="fb-list">' + C.zonas.map(function (z, k) {
                var m = marcadas.indexOf(z.id) >= 0, okk = z.problema === m;
                return '<li class="' + (okk ? 'ok' : 'bad') + '"><b>Elemento ' + (k + 1) + ' · ' + (z.problema ? 'tenía un problema' : 'estaba bien') + '.</b> ' + esc(z.fb) + '</li>';
              }).join('') + '</ol>' : '') +
            (revisado
              ? '<div class="btn-row"><button class="btn outline" id="retry">' + icon('rotate') + 'De nuevo</button><button class="btn primary" data-go="/leccion/' + id + '/aplica">Aplicar a mi producto' + icon('arrow') + '</button></div>'
              : '<button class="btn primary block" id="rev"' + (marcadas.length ? '' : ' disabled') + '>Revisar mi análisis (' + marcadas.length + ' marcado' + (marcadas.length === 1 ? '' : 's') + ')</button>');
          $$('.zone', box).forEach(function (b) {
            b.onclick = function () {
              var z = b.getAttribute('data-z'), i = marcadas.indexOf(z);
              if (i >= 0) marcadas.splice(i, 1); else marcadas.push(z);
              paint();
            };
          });
          var rv = $('#rev', box);
          if (rv) rv.onclick = function () {
            revisado = true;
            var probsIds = probs.map(function (z) { return z.id; });
            var hits = marcadas.filter(function (z) { return probsIds.indexOf(z) >= 0; }).length;
            var falsas = marcadas.length - hits;
            var puntaje = Math.max(0, (hits - falsas) / probs.length);
            if (!st.revisiones) observar(id, puntaje >= 0.75, 'caso');
            st.revisiones = (st.revisiones || 0) + 1; st.marcadas = marcadas.slice(); st.puntaje = puntaje; st.revisada = true;
            save(); log('caso', { leccion: id, aciertos: hits, falsas: falsas, total: probs.length, revision: st.revisiones });
            paint();
            var tm = $('.tutor-msg', box); if (tm) tm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          };
          var rt = $('#retry', box);
          if (rt) rt.onclick = function () { revisado = false; marcadas = []; st.revisada = false; save(); paint(); };
          bindGo(box);
        }
        paint();
      }
    };
  }

  // Retroalimentación pedagógica sobre la decisión de diseño del estudiante
  function evaluarDecision(l, c, ronda) {
    var out = [];
    var tieneUsuario = /usuari|estudiant|nin|docent|person|quien|alumn|profe|joven|adult|mayor/.test(norm(c.problema));
    if (palabras(c.donde) < 6) out.push(['donde', 'mejorar', 'Cuéntame más sobre el estado actual: ¿en qué pantalla o momento de ' + esc(S.perfil.producto) + ' aparece y qué hace hoy el usuario ahí?']);
    else out.push(['donde', 'ok', 'Describes con claridad el estado inicial.']);
    if (palabras(c.problema) < 6) out.push(['problema', 'mejorar', '¿Qué le pasaría concretamente al usuario? Descríbelo como si lo estuvieras observando.']);
    else if (!tieneUsuario) out.push(['problema', 'mejorar', 'Identificas un problema, pero ¿a qué usuario afecta? Recuerda que tus usuarios son: ' + esc(S.perfil.usuarios) + '.']);
    else out.push(['problema', 'ok', 'Nombras el problema y a quién afecta.']);
    if (palabras(c.ajuste) < 6) out.push(['ajuste', 'mejorar', '¿Qué cambiarías exactamente? Descríbelo con el detalle suficiente para que un compañero pudiera implementarlo.']);
    else out.push(['ajuste', 'ok', 'Tu ajuste es concreto.']);
    var t = norm(c.porque);
    var hallados = l.aplica.claves.filter(function (k) { return t.indexOf(norm(k)) >= 0; });
    // Palabras del propio estudiante que contienen cada raíz (para citarlas en la retroalimentación)
    var suyas = [];
    hallados.forEach(function (k) {
      var w = String(c.porque).split(/[^\wÁÉÍÓÚÜÑáéíóúüñ]+/).filter(function (x) { return norm(x).indexOf(norm(k)) >= 0; })[0];
      if (w && suyas.indexOf(w.toLowerCase()) < 0) suyas.push(w.toLowerCase());
    });
    var nombra = t.indexOf(norm(l.termino).replace(/s$/, '')) >= 0;
    if (palabras(c.porque) < 8) out.push(['porque', 'mejorar', 'La justificación es el corazón de la decisión. ¿Qué relación tiene tu ajuste con el principio de ' + l.termino.toLowerCase() + '? Recuerda: ' + esc(l.clave)]);
    else if (hallados.length + (nombra ? 1 : 0) < 2) out.push(['porque', 'mejorar', 'Vas bien, pero tu justificación todavía no muestra cómo el ajuste aplica el principio. ' + preguntaPrincipio(l)]);
    else out.push(['porque', 'ok', 'Tu justificación conecta el ajuste con el principio' + (suyas.length ? ' (usas ideas como: ' + esc(suyas.slice(0, 4).join(', ')) + ')' : '') + '.']);
    var mejorar = out.filter(function (o) { return o[1] === 'mejorar'; }).length;
    return { items: out, ok: mejorar === 0, guia: mejorar > 0 && ronda >= 2 };
  }
  function preguntaPrincipio(l) {
    return ({
      affordances: '¿Para qué usuario la acción se vuelve posible o perceptible gracias al ajuste?',
      significantes: '¿Qué señal comunica ahora dónde y cómo actuar, y qué no se notaba antes?',
      restricciones: '¿Qué error evita tu restricción, de qué tipo es y cómo cuidas que no frustre?',
      mapeo: '¿Qué relación entre control y efecto (o entre ubicación y contenido) se vuelve evidente?',
      retroalimentacion: '¿Cómo hace tu ajuste que el resultado sea inmediato, informativo y en su justa medida?',
      'modelo-conceptual': '¿Qué cree el usuario sobre cómo funciona tu producto, y cómo tu ajuste acerca esa idea al funcionamiento real?'
    })[l.id];
  }

  function pasoAplica(l) {
    var id = l.id, A = l.aplica;
    if (!S.perfil) {
      return {
        html: tutorMsg('<p>Para aplicar el principio necesito conocer el producto que estás diseñando.</p>') +
          '<button class="btn primary block" data-go="/producto">Registrar mi producto' + icon('arrow') + '</button>',
        mount: bindGo
      };
    }
    var st = S.aplica[id] || (S.aplica[id] = { campos: { donde: '', problema: '', ajuste: '', porque: '' }, rondas: 0, historial: [], guia: false, ejemplo: false, guardado: false });
    var ultimo = null;
    var CAMPOS = [['donde', 'Estado inicial', A.donde], ['problema', 'Problema', A.problema], ['ajuste', 'Ajuste', A.ajuste], ['porque', 'Justificación', A.porque]];
    return {
      speak: function () { return 'Aplica ' + l.termino + ' a tu producto ' + S.perfil.producto + '. ' + CAMPOS.map(function (c) { return c[2]; }).join(' '); },
      html: '<div id="ap" class="stack"></div>',
      mount: function (el) {
        var box = $('#ap', el);
        function paint() {
          if (st.guardado && st.cerrada) return cierre();
          var ev = ultimo;
          box.innerHTML =
            '<div class="row wrap"><span class="chip primary">' + icon('pencil') + esc(S.perfil.producto) + '</span><span class="chip slate">' + esc(S.perfil.tipo) + '</span><span class="chip slate">' + icon('users') + esc(S.perfil.usuarios) + '</span></div>' +
            tutorMsg('<p>Ahora revisemos <b>' + esc(S.perfil.producto) + '</b> desde el principio de ' + esc(l.termino.toLowerCase()) + '. Responde las cuatro preguntas: describe lo que hay, el problema, tu ajuste y por qué. Te daré retroalimentación antes de guardar la decisión en tu bitácora.</p>') +
            (st.guardado ? '<div class="feedback ok">' + icon('checkCircle') + '<div><b>Decisión guardada en tu bitácora.</b><p>Puedes seguir ajustándola y volver a guardarla.</p></div></div>' : '') +
            '<form id="apf" class="stack" autocomplete="off">' + CAMPOS.map(function (c, k) {
              var it = ev ? ev.items.filter(function (x) { return x[0] === c[0]; })[0] : null;
              return '<label class="fld"><span><b class="fn">' + (k + 1) + '</b>' + c[1] + '</span><small>' + esc(c[2]) + '</small>' +
                '<textarea name="' + c[0] + '" rows="3">' + esc(st.campos[c[0]]) + '</textarea>' +
                (it ? '<span class="fld-fb ' + it[1] + '">' + icon(it[1] === 'ok' ? 'checkCircle' : 'help') + '<span>' + it[2] + '</span></span>' : '') + '</label>';
            }).join('') + '</form>' +
            (ev ? tutorMsg(ev.ok
              ? '<p><b>Tu decisión está bien argumentada.</b> Describe el estado inicial, el problema para un usuario concreto, un ajuste implementable y una justificación que aplica el principio. Guárdala en tu bitácora.</p>'
              : '<p>Revisé tu decisión (ronda ' + st.rondas + '). Mira las preguntas marcadas en cada campo; ' + (ev.guia ? 'como ya es la segunda revisión, te doy una orientación más directa:' : 'piénsalas y vuelve a pedirme retroalimentación.') + '</p>' +
                (ev.guia ? '<p class="guide">' + esc(A.guia) + '</p>' : ''), { cls: ev.ok ? 'ok' : 'warn', valorar: id + ':aplica:r' + st.rondas }) : '') +
            '<button class="btn primary block" id="evalBtn">' + icon('teacher') + (st.rondas ? 'Volver a revisar mi decisión' : 'Pedir retroalimentación al tutor') + '</button>' +
            (st.rondas ? '<div class="btn-row even"><button class="btn outline" id="exBtn">' + icon('bulb') + 'Ver un ejemplo</button><button class="btn teal" id="saveBtn">' + icon('book') + 'Guardar en bitácora</button></div>' : '') +
            (st.ejemplo ? '<section class="card dashed stack"><p class="section-label">Ejemplo de otra persona (no es tu respuesta)</p><p>' + esc(A.ejemplo) + '</p><p class="small muted">Úsalo como referente, no como plantilla: tu producto y tus usuarios son distintos.</p></section>' : '');
          $('#apf', box).oninput = function (e) { if (e.target.name) { st.campos[e.target.name] = e.target.value; save(); } };
          $('#evalBtn', box).onclick = function () {
            var vacios = CAMPOS.filter(function (c) { return !st.campos[c[0]].trim(); });
            if (vacios.length === 4) { toast('Escribe al menos un primer borrador para poder revisarlo contigo.'); return; }
            st.rondas++;
            ultimo = evaluarDecision(l, st.campos, st.rondas);
            if (ultimo.guia) st.guia = true;
            st.historial.push({ t: Date.now(), campos: Object.assign({}, st.campos), ok: ultimo.ok, mejorar: ultimo.items.filter(function (x) { return x[1] === 'mejorar'; }).map(function (x) { return x[0]; }) });
            if (st.rondas === 1) observar(id, ultimo.ok, 'aplica');
            save(); log('aplica', { leccion: id, ronda: st.rondas, ok: ultimo.ok, guia: ultimo.guia });
            paint();
            var tm = $$('.tutor-msg', box); if (tm.length) tm[tm.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
          };
          var ex = $('#exBtn', box);
          if (ex) ex.onclick = function () { if (!st.ejemplo) { st.ejemplo = true; save(); log('ejemplo', { leccion: id }); } paint(); };
          var sv = $('#saveBtn', box);
          if (sv) sv.onclick = function () {
            var okk = ultimo ? ultimo.ok : (st.historial.length && st.historial[st.historial.length - 1].ok);
            function guardar() {
              st.guardado = true; st.fecha = Date.now(); st.cerrada = true; save();
              log('decision', { leccion: id, rondas: st.rondas, ok: !!okk, ejemplo: st.ejemplo, guia: st.guia });
              paint();
            }
            if (!okk) confirmSheet('¿Guardar así?', 'Algunos campos todavía tienen preguntas abiertas. Puedes guardarla ahora y mejorarla después.', 'Guardar').then(function (y) { if (y) guardar(); });
            else guardar();
          };
          bindRate(box);
        }
        function cierre() {
          var r = S.reflexion[id] || { texto: '', semaforo: null };
          box.innerHTML =
            '<div class="feedback ok">' + icon('checkCircle') + '<div><b>Decisión guardada en tu bitácora.</b><p>' + esc(l.termino) + ' · ' + esc(S.perfil.producto) + '</p></div></div>' +
            '<section class="card stack"><p class="section-label">Reflexiona</p><h2 class="h3">' + esc(l.reflexion) + '</h2>' +
            '<textarea id="rf" rows="3" placeholder="Escribe con tus palabras">' + esc(r.texto) + '</textarea>' +
            '<p class="h3">¿Cómo te sientes con este principio?</p>' +
            '<div class="semaforo">' + [['claro', 'Lo tengo claro', '#2fa866'], ['dudas', 'Tengo dudas', '#e5a913'], ['repasar', 'Necesito repasar', '#e05a5a']].map(function (s) {
              return '<button data-s="' + s[0] + '" aria-pressed="' + (r.semaforo === s[0]) + '"><i style="background:' + s[2] + '"></i>' + s[1] + '</button>';
            }).join('') + '</div></section>' +
            '<button class="btn primary block" id="finBtn">Terminar la lección' + icon('check') + '</button>' +
            '<button class="btn ghost block" id="editBtn">Seguir ajustando mi decisión</button>';
          $$('[data-s]', box).forEach(function (b) { b.onclick = function () { r.semaforo = b.getAttribute('data-s'); $$('[data-s]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
          $('#editBtn', box).onclick = function () { st.cerrada = false; save(); paint(); };
          $('#finBtn', box).onclick = function () {
            r.texto = $('#rf', box).value.trim(); r.fecha = Date.now();
            if (!r.semaforo) { toast('Elige cómo te sientes con el principio.'); return; }
            S.reflexion[id] = r;
            var nueva = !S.completas[id];
            S.completas[id] = Date.now(); save();
            log('reflexion', { leccion: id, semaforo: r.semaforo, palabras: palabras(r.texto) });
            if (nueva) log('completa', { leccion: id, dominio: Math.round(dom(id) * 100) / 100 });
            var sig = recomendacion();
            sheet('<div class="tut-art">' + icon('award') + '</div><h2 class="h1">¡Lección terminada!</h2>' +
              '<p class="lead">Trabajaste ' + esc(l.termino.toLowerCase()) + ' y lo aplicaste a ' + esc(S.perfil.producto) + '.' +
              (r.semaforo === 'repasar' ? ' Dijiste que necesitas repasar: puedes volver a las situaciones cuando quieras.' : '') + '</p>' +
              '<p class="small"><b>' + esc(sig.small) + ':</b> ' + esc(sig.nombre) + '</p>' +
              '<div class="btn-row even"><button class="btn outline" data-r="/ruta">Ver la ruta</button><button class="btn primary" data-r="' + sig.go + '">Continuar</button></div>',
              function (sh, close) { $$('[data-r]', sh).forEach(function (b) { b.onclick = function () { close(); go(b.getAttribute('data-r')); }; }); });
          };
        }
        paint();
      }
    };
  }

  /* Bitácora de decisiones */
  function decisionesMD() {
    var p = S.perfil || {};
    var md = '# Bitácora de decisiones de diseño\n\n**Producto:** ' + (p.producto || '') + ' (' + (p.tipo || '') + ')  \n**Usuarios:** ' + (p.usuarios || '') + '  \n**Autor/a:** ' + (p.nombre || '') + '  \n**Fecha:** ' + fecha(Date.now()) + '\n\n';
    md += '> Criterios UX: principios fundamentales de la interacción de Norman (2013).\n\n';
    D.LECCIONES.forEach(function (l) {
      var a = S.aplica[l.id];
      md += '## ' + l.n + '. ' + l.termino + '\n\n';
      if (!a || !a.guardado) { md += '_Pendiente._\n\n'; return; }
      md += '- **Estado inicial:** ' + a.campos.donde + '\n- **Problema:** ' + a.campos.problema + '\n- **Ajuste:** ' + a.campos.ajuste + '\n- **Justificación:** ' + a.campos.porque + '\n';
      md += '- _Rondas de retroalimentación: ' + a.rondas + (a.ejemplo ? ' · consultó un ejemplo' : '') + '_\n';
      var r = S.reflexion[l.id];
      if (r && r.texto) md += '- **Reflexión:** ' + r.texto + '\n';
      md += '\n';
    });
    var I = S.integracion;
    if (I.fecha) {
      md += '## Integración\n\n';
      D.INTEGRACION.preguntas.forEach(function (q, k) { md += '**' + q + '**\n\n' + (I.resp[k] || '') + '\n\n'; });
    }
    return md;
  }
  function viewBitacora() {
    var ds = D.LECCIONES.filter(function (l) { return S.aplica[l.id] && S.aplica[l.id].guardado; });
    return {
      title: 'Mi bitácora', eyebrow: S.perfil ? S.perfil.producto : '', back: '/inicio', navKey: 'bitacora',
      html:
        '<p class="lead">Tus decisiones de diseño, del estado inicial al ajuste, con su justificación.</p>' +
        (ds.length ? ds.map(function (l) {
          var a = S.aplica[l.id];
          return '<details class="card mat-card" style="--mc:var(--' + l.color + ')"><summary><span class="row"><span class="badge-ic sm c-' + l.color + '">' + icon(l.icono) + '</span><strong>' + l.n + '. ' + esc(l.termino) + '</strong></span></summary>' +
            '<dl class="dec">' +
            '<dt>Estado inicial</dt><dd>' + esc(a.campos.donde) + '</dd><dt>Problema</dt><dd>' + esc(a.campos.problema) + '</dd>' +
            '<dt>Ajuste</dt><dd>' + esc(a.campos.ajuste) + '</dd><dt>Justificación</dt><dd>' + esc(a.campos.porque) + '</dd></dl>' +
            '<p class="small muted">' + a.rondas + ' ronda' + (a.rondas === 1 ? '' : 's') + ' de retroalimentación · ' + fecha(a.fecha) + '</p>' +
            '<a class="btn ghost" href="#/leccion/' + l.id + '/aplica">' + icon('pencil') + 'Editar</a></details>';
        }).join('') : '<div class="card dashed stack center"><p>Aún no has guardado decisiones.</p><p class="small muted">Se guardan en el paso “Aplica” de cada lección.</p></div>') +
        (ds.length ? '<button class="btn outline block" id="dl">' + icon('download') + 'Descargar bitácora (.md)</button>' : ''),
      mount: function (el) {
        var b = $('#dl', el);
        if (b) b.onclick = function () { descargar('bitacora-' + norm(S.perfil.producto).replace(/[^a-z0-9]+/g, '-') + '.md', decisionesMD(), 'text/markdown;charset=utf-8'); log('exportar', { que: 'bitacora' }); };
      }
    };
  }

  /* Integración */
  function viewIntegracion() {
    var I = S.integracion;
    var ds = D.LECCIONES.filter(function (l) { return S.aplica[l.id] && S.aplica[l.id].guardado; });
    return {
      title: 'Integración', eyebrow: 'Los seis principios', back: '/ruta', navKey: 'ruta',
      html:
        tutorMsg('<p>' + esc(D.INTEGRACION.intro) + ' Esta mirada de conjunto te ayuda a ver si tus ajustes son coherentes entre sí.</p>') +
        '<section class="card stack"><h2 class="h3">Tus decisiones por principio</h2>' + D.LECCIONES.map(function (l) {
          var a = S.aplica[l.id], ok = a && a.guardado;
          return '<div class="int-row"><span class="badge-ic sm c-' + l.color + '">' + icon(l.icono) + '</span><div><strong>' + esc(l.termino) + '</strong><p class="small ' + (ok ? '' : 'muted') + '">' + (ok ? esc(a.campos.ajuste) : 'Pendiente · <a href="#/leccion/' + l.id + '/aplica">aplicarlo</a>') + '</p></div></div>';
        }).join('') + '</section>' +
        (ds.length < 3 ? '<div class="banner">' + icon('info') + '<span>Te recomiendo integrar cuando tengas al menos tres decisiones guardadas. Llevas ' + ds.length + '.</span></div>' : '') +
        '<form id="itf" class="stack">' + D.INTEGRACION.preguntas.map(function (q, k) {
          return '<label class="fld"><span>' + esc(q) + '</span><textarea name="q' + k + '" rows="3">' + esc(I.resp[k] || '') + '</textarea></label>';
        }).join('') +
        '<button class="btn primary block" type="submit">' + icon('check') + 'Guardar integración</button></form>' +
        '<button class="btn outline block" id="dl">' + icon('download') + 'Descargar informe de diseño (.md)</button>',
      mount: function (el) {
        $('#itf', el).onsubmit = function (e) {
          e.preventDefault();
          I.resp = D.INTEGRACION.preguntas.map(function (_, k) { return e.target['q' + k].value.trim(); });
          var vacias = I.resp.filter(function (r) { return palabras(r) < 5; }).length;
          I.fecha = Date.now(); save(); log('integracion', { decisiones: ds.length, respuestasCortas: vacias });
          toast(vacias ? 'Guardado. Algunas respuestas son muy breves: argumenta con un principio.' : 'Integración guardada.');
        };
        $('#dl', el).onclick = function () { descargar('informe-diseno.md', decisionesMD(), 'text/markdown;charset=utf-8'); log('exportar', { que: 'informe' }); };
      }
    };
  }

  /* Progreso */
  function metricas() {
    var ev = S.eventos;
    var resp = ev.filter(function (e) { return e.tipo === 'respuesta'; });
    var primeras = resp.filter(function (e) { return e.intento === 1; });
    var autonomas = primeras.filter(function (e) { return e.correcta && !e.ayudas; }).length;
    var ayudas = ev.filter(function (e) { return e.tipo === 'ayuda'; });
    var porNivel = [0, 0, 0, 0];
    ayudas.forEach(function (a) { porNivel[a.nivel - 1]++; });
    var resueltas = resp.filter(function (e) { return e.correcta; });
    var dependientes = resueltas.filter(function (e) { return e.ayudas >= 3; }).length + ev.filter(function (e) { return e.tipo === 'ejemplo'; }).length;
    var basesDep = resueltas.length + ev.filter(function (e) { return e.tipo === 'decision'; }).length;
    var errores = {};
    resp.filter(function (e) { return !e.correcta; }).forEach(function (e) {
      var k = e.leccion + '|' + e.q + '|' + e.op;
      errores[k] = errores[k] || { leccion: e.leccion, q: e.q, texto: e.texto, n: 0 };
      errores[k].n++;
    });
    var val = ev.filter(function (e) { return e.tipo === 'valoracion'; });
    return {
      respuestas: resp.length, primeras: primeras.length, autonomas: autonomas,
      autonomia: primeras.length ? autonomas / primeras.length : 0,
      ayudas: ayudas.length, porNivel: porNivel,
      dependencia: basesDep ? dependientes / basesDep : 0,
      errores: Object.keys(errores).map(function (k) { return errores[k]; }).sort(function (a, b) { return b.n - a.n; }),
      casos: ev.filter(function (e) { return e.tipo === 'caso'; }).length,
      decisiones: D.LECCIONES.filter(function (l) { return S.aplica[l.id] && S.aplica[l.id].guardado; }).length,
      rondas: D.LECCIONES.reduce(function (a, l) { return a + ((S.aplica[l.id] || {}).rondas || 0); }, 0),
      valoraciones: val.length, utiles: val.filter(function (v) { return v.util; }).length
    };
  }
  function viewProgreso() {
    var m = metricas();
    return {
      title: 'Mi progreso', back: '/inicio', navKey: 'progreso',
      html:
        '<section class="card stack"><div class="row between"><h2 class="h3">Dominio por principio</h2><button class="linkish" id="how">¿Cómo se calcula?</button></div>' +
        D.LECCIONES.map(function (l) {
          var nd = nivelDominio(l.id), r = S.reflexion[l.id];
          return '<div class="mod-progress"><span>' + l.n + '. ' + esc(l.termino) + (S.completas[l.id] ? ' ' + icon('checkCircle', 'ok-ic') : '') + '</span><span class="chip ' + nd.cls + '">' + pct(dom(l.id)) + ' % · ' + nd.label + '</span>' +
            '<div class="bar"><i style="width:' + Math.max(pct(dom(l.id)), 2) + '%"></i></div>' +
            (r && r.semaforo ? '<small class="muted">Tu autoevaluación: ' + ({ claro: 'lo tengo claro', dudas: 'tengo dudas', repasar: 'necesito repasar' })[r.semaforo] + '</small>' : '') + '</div>';
        }).join('') + '</section>' +
        '<section class="card"><h2 class="h3">Tu forma de trabajar</h2><dl class="kv">' +
        '<dt>Situaciones resueltas al primer intento sin ayuda</dt><dd>' + m.autonomas + ' de ' + m.primeras + '</dd>' +
        '<dt>Ayudas pedidas</dt><dd>' + m.ayudas + '</dd>' +
        '<dt>Casos analizados</dt><dd>' + m.casos + '</dd>' +
        '<dt>Decisiones en tu bitácora</dt><dd>' + m.decisiones + ' de 6</dd>' +
        '<dt>Rondas de retroalimentación</dt><dd>' + m.rondas + '</dd></dl></section>' +
        tutorMsg('<p>' + (m.primeras === 0 ? 'Cuando empieces a practicar, aquí verás cómo avanzas.' :
          m.autonomia >= 0.7 ? 'Resuelves la mayoría de situaciones por tu cuenta. Aprovecha el paso “Aplica” para llevar esa claridad a tu producto.' :
          'Pedir ayuda está bien: es parte de aprender. Intenta primero pensar la situación con la definición del principio; así las ayudas se vuelven cada vez menos necesarias.') + '</p>'),
      mount: function (el) { $('#how', el).onclick = explicarModelo; }
    };
  }

  /* Panel docente */
  function viewDocente() {
    var m = metricas(), p = S.perfil || {};
    return {
      title: 'Panel docente', eyebrow: 'Datos de este dispositivo', back: '/ayuda', navKey: 'ayuda',
      html:
        '<div class="banner">' + icon('shield') + '<span>Estas métricas se calculan a partir de la interacción con el tutor y <b>carecen de contexto psicosocial</b>. Triangúlalas con tu observación en el aula antes de tomar decisiones sobre el proceso del estudiante.</span></div>' +
        '<section class="card"><h2 class="h3">Estudiante y producto</h2><dl class="kv">' +
        '<dt>Nombre</dt><dd>' + esc(p.nombre || '—') + '</dd><dt>Producto</dt><dd>' + esc(p.producto || '—') + '</dd>' +
        '<dt>Tipo</dt><dd>' + esc(p.tipo || '—') + '</dd><dt>Usuarios</dt><dd>' + esc(p.usuarios || '—') + '</dd>' +
        '<dt>Diagnóstico</dt><dd>' + (S.diag ? (S.diag.omitido ? 'Omitido' : D.DIAGNOSTICO.filter(function (q, k) { return S.diag.resp[k] === q.ok; }).length + ' de 6') : 'Pendiente') + '</dd></dl></section>' +
        '<section class="card"><h2 class="h3">Indicadores de mediación</h2><dl class="kv">' +
        '<dt>Autonomía (aciertos al primer intento sin ayuda)</dt><dd>' + pct(m.autonomia) + ' %</dd>' +
        '<dt>Dependencia cognitiva (ayudas de nivel 3–4 y ejemplos sobre producciones)</dt><dd>' + pct(m.dependencia) + ' %</dd>' +
        '<dt>Ayudas por nivel (pregunta · definición · descarte · explicación)</dt><dd>' + m.porNivel.join(' · ') + '</dd>' +
        '<dt>Rondas de retroalimentación sobre decisiones</dt><dd>' + m.rondas + '</dd>' +
        '<dt>Valoraciones de la ayuda (útiles / total)</dt><dd>' + m.utiles + ' / ' + m.valoraciones + '</dd></dl></section>' +
        '<section class="card stack"><h2 class="h3">Dominio y estado por principio</h2><div class="table-wrap"><table class="cuadro"><thead><tr><th>Principio</th><th>Dominio</th><th>Práctica</th><th>Caso</th><th>Decisión</th><th>Semáforo</th></tr></thead><tbody>' +
        D.LECCIONES.map(function (l) {
          var pz = pasos(l.id), c = S.caso[l.id], a = S.aplica[l.id], r = S.reflexion[l.id];
          return '<tr><td>' + esc(l.termino) + '</td><td>' + pct(dom(l.id)) + ' %</td><td>' + (pz.practica ? '✓' : '—') + '</td><td>' + (c && c.revisiones ? pct(c.puntaje) + ' %' : '—') + '</td><td>' + (a && a.guardado ? a.rondas + ' rondas' : '—') + '</td><td>' + (r && r.semaforo ? r.semaforo : '—') + '</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<section class="card stack"><h2 class="h3">Concepciones erróneas más frecuentes</h2>' +
        (m.errores.length ? '<ol class="fb">' + m.errores.slice(0, 8).map(function (e) {
          return '<li><b>' + esc(L(e.leccion).termino) + ', situación ' + (e.q + 1) + ' (' + e.n + '×):</b> “' + esc(e.texto) + '”</li>';
        }).join('') + '</ol>' : '<p class="muted small">Sin errores registrados.</p>') + '</section>' +
        '<section class="card stack"><h2 class="h3">Exportar para la investigación</h2>' +
        '<p class="small muted">' + S.eventos.length + ' eventos registrados en este dispositivo.</p>' +
        '<div class="btn-row even"><button class="btn outline" id="xj">' + icon('download') + 'JSON completo</button><button class="btn outline" id="xc">' + icon('download') + 'Eventos (.csv)</button></div>' +
        '<button class="btn ghost block" id="xm">' + icon('book') + 'Bitácora del estudiante (.md)</button></section>',
      mount: function (el) {
        var base = 'edututor-' + norm(p.nombre || 'estudiante').replace(/[^a-z0-9]+/g, '-');
        $('#xj', el).onclick = function () { descargar(base + '.json', JSON.stringify({ exportado: new Date().toISOString(), estado: S, metricas: m }, null, 2), 'application/json'); };
        $('#xc', el).onclick = function () {
          var cols = ['t', 'fecha', 'tipo', 'leccion', 'q', 'op', 'correcta', 'intento', 'ayudas', 'nivel', 'ayuda', 'ronda', 'ok', 'guia', 'util', 'semaforo', 'ms', 'texto'];
          var rows = [cols.join(',')].concat(S.eventos.map(function (e) {
            var o = Object.assign({ fecha: new Date(e.t).toISOString() }, e);
            return cols.map(function (c) { var v = o[c] == null ? '' : String(o[c]); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',');
          }));
          descargar(base + '-eventos.csv', '﻿' + rows.join('\n'), 'text/csv;charset=utf-8');
        };
        $('#xm', el).onclick = function () { descargar(base + '-bitacora.md', decisionesMD(), 'text/markdown;charset=utf-8'); };
      }
    };
  }

  /* Ayuda y accesibilidad */
  function viewAyuda() {
    function seg(name, opts, val) {
      return '<span class="seg" role="group">' + opts.map(function (o) { return '<button data-' + name + '="' + o[0] + '" aria-pressed="' + (String(val) === String(o[0])) + '">' + o[1] + '</button>'; }).join('') + '</span>';
    }
    return {
      title: 'Ayuda y accesibilidad', back: '/inicio', navKey: 'ayuda',
      html:
        '<section class="card"><h2 class="h3">Accesibilidad</h2>' +
        '<div class="setting"><span><strong>Tamaño del texto</strong><small>También con el botón Aa de arriba</small></span>' + seg('texto', [[0, 'A'], [1, 'A+'], [2, 'A++']], S.ajustes.texto) + '</div>' +
        '<div class="setting"><span><strong>Alto contraste</strong><small>Texto negro sobre fondo blanco</small></span><button class="switch" id="contrast" role="switch" aria-checked="' + !!S.ajustes.contraste + '" aria-label="Alto contraste"></button></div>' +
        '<div class="setting"><span><strong>Velocidad de lectura</strong><small>Para el botón de altavoz</small></span>' + seg('vel', [[0, 'Lenta'], [1, 'Normal']], S.ajustes.velocidad) + '</div></section>' +
        '<section class="card stack"><h2 class="h3">Cómo te acompaña el tutor</h2><ul class="fb">' +
        '<li><b>Andamiaje.</b> Ofrece ayudas en cuatro niveles —pregunta orientadora, recordar el principio, descartar una opción y explicación del paso— y las va retirando a medida que dominas el principio.</li>' +
        '<li><b>Retroalimentación pedagógica.</b> Responde a la opción que elegiste y a lo que escribes sobre tu producto, no con un “incorrecto” genérico.</li>' +
        '<li><b>Reflexión.</b> Cada lección termina con una pregunta para pensar tu proceso.</li>' +
        '<li><b>Agencia.</b> Tú eliges qué lección abrir y cuándo pedir ayuda; el tutor recomienda y explica por qué.</li></ul>' +
        '<p class="small muted">El tutor no diseña tu producto por ti: te pide describir y justificar tus decisiones.</p></section>' +
        '<section class="card"><h2 class="h3">Para el docente</h2>' +
        '<a class="item" href="#/docente"><span class="thumb c-violet">' + icon('teacher') + '</span><span><strong>Panel docente</strong><small>Indicadores, concepciones erróneas y exportación</small></span><span class="go">' + icon('next') + '</span></a></section>' +
        '<section class="card stack"><h2 class="h3">Mi progreso</h2><p class="small muted">Tu avance se guarda solo en este dispositivo y navegador. Descarga tu bitácora si cambias de equipo.</p>' +
        '<button class="btn outline" id="resetBtn" style="color:var(--bad);border-color:var(--bad)">' + icon('trash') + 'Borrar mi progreso</button></section>' +
        '<section class="card stack"><div class="row">' + logo('sm') + '<h2 class="h3">Acerca de UX-EduTutor</h2></div>' +
        '<p class="credits">Agente tutor inteligente para la aplicación de criterios de experiencia de usuario en productos digitales educativos desarrollados por estudiantes de la Licenciatura en Informática de la Universidad de Córdoba.</p>' +
        '<p class="credits">Contenido basado en ' + esc(D.LIBRO) + ' Definiciones parafraseadas en español.</p>' +
        '<p class="credits">Sistema de diseño de Orbita 3D. Íconos: Lucide (ISC). Tipografía: Nunito (OFL).</p></section>',
      mount: function (el) {
        $$('[data-texto]', el).forEach(function (b) { b.onclick = function () { S.ajustes.texto = Number(b.getAttribute('data-texto')); save(); applySettings(); render(); }; });
        $$('[data-vel]', el).forEach(function (b) { b.onclick = function () { S.ajustes.velocidad = Number(b.getAttribute('data-vel')); save(); $$('[data-vel]', el).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
        $('#contrast', el).onclick = function () { S.ajustes.contraste = !S.ajustes.contraste; save(); applySettings(); this.setAttribute('aria-checked', String(S.ajustes.contraste)); };
        $('#resetBtn', el).onclick = function () {
          confirmSheet('¿Borrar tu progreso?', 'Se borrarán tu producto, tus decisiones, tu dominio estimado y el registro de actividad de este dispositivo.', 'Borrar').then(function (y) {
            if (!y) return;
            S = fresh(); save(); applySettings(); toast('Progreso borrado.'); go('/');
          });
        };
      }
    };
  }

  /* =========================================================
   * Arranque
   * ======================================================= */
  function boot() {
    $('#nav').innerHTML = [
      ['/inicio', 'home', 'Inicio', 'inicio'], ['/ruta', 'layers', 'Ruta', 'ruta'], ['/bitacora', 'book', 'Bitácora', 'bitacora'],
      ['/progreso', 'trophy', 'Progreso', 'progreso'], ['/ayuda', 'help', 'Ayuda', 'ayuda']
    ].map(function (n) { return '<a href="#' + n[0] + '" data-k="' + n[3] + '">' + icon(n[1]) + n[2] + '</a>'; }).join('');
    current = path();
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
