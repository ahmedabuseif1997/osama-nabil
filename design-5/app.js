/* Design 5 — Orbit: spinning label ring, tilt portrait, scroll-spun 3D cylinder gallery, stacked services, process cube. */
(function () {
  'use strict';
  var PF = window.PF, M = window.Motion;
  var SERVICES = ['branding', 'social', 'print', 'profile', 'type'];
  var SVC_IMG = { branding: ['relief-cafe', 1], social: ['asiar', 0], print: ['liwa-2025', 0], profile: ['marble-profile', 0], type: ['typography', 0] };
  var root = document.documentElement;
  var spinBoost = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ordered() { return PF.projects.filter(function (p) { return p.featured; }).concat(PF.projects.filter(function (p) { return !p.featured; })); }
  function imgOf(slug, i) { var p = PF.bySlug(slug); return PF.img(slug, p.images[Math.min(i, p.images.length - 1)][0]); }

  /* ---------- Orbiting labels ---------- */
  function renderOrbit() {
    var ring = document.getElementById('orbitRing');
    var r = Math.min(300, innerWidth * 0.4);
    ring.innerHTML = SERVICES.map(function (k, i) {
      return '<span style="--a:' + (i * 360 / SERVICES.length) + 'deg;--r:' + r + 'px">' + esc(PF.catLabel(k)) + '</span>';
    }).join('');
  }

  function spinOrbit() {
    var ring = document.getElementById('orbitRing'), a = 0;
    if (M.reduce) return;
    (function tick() {
      spinBoost *= 0.94;
      a += 0.18 + spinBoost;
      ring.style.setProperty('--spin', (a % 360).toFixed(2) + 'deg');
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Cylinder gallery ---------- */
  var list = [], cards = [], wheel, ringSec, geo = {}, front = -1;

  function buildRing() {
    wheel = document.getElementById('wheel');
    ringSec = document.getElementById('work');
    list = ordered();
    wheel.innerHTML = '';
    cards = list.map(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ring__card';
      b.setAttribute('aria-label', PF.t('work.open') + ': ' + PF.pick(p.title));
      b.innerHTML = '<img alt="" src="' + PF.cover(p) + '"' + (i > 4 && i < list.length - 4 ? ' loading="lazy"' : '') + '>';
      b.addEventListener('click', function () { PF.lightbox.open(p, 0); });
      wheel.appendChild(b);
      return b;
    });
    layoutRing();
    front = -1;
  }

  function layoutRing() {
    var n = list.length, vw = innerWidth;
    geo.cw = vw < 640 ? 170 : Math.round(Math.max(200, Math.min(260, vw * 0.17)));
    geo.step = 360 / n;
    geo.r = Math.round((geo.cw + 26) * n / (2 * Math.PI));
    cards.forEach(function (c, i) {
      c.style.setProperty('--cw', geo.cw + 'px');
      c.style.transform = 'rotateY(' + (i * geo.step).toFixed(3) + 'deg) translateZ(' + geo.r + 'px)';
    });
  }

  function updateRing(y, vel) {
    var p = M.progress(ringSec, y);
    var rot = p * geo.step * (list.length - 1);
    var tilt = M.clamp(-6 + vel * 0.04, -16, 6);
    wheel.style.transform = 'translateZ(' + (-geo.r) + 'px) rotateX(' + tilt.toFixed(2) + 'deg) rotateY(' + (-rot).toFixed(2) + 'deg)';
    var f = Math.round(rot / geo.step) % list.length;
    cards.forEach(function (c, i) {
      var d = ((i * geo.step - rot) % 360 + 540) % 360 - 180;
      c.style.pointerEvents = Math.abs(d) < 60 ? 'auto' : 'none';
      c.tabIndex = Math.abs(d) < 60 ? 0 : -1;
    });
    if (f !== front) {
      if (cards[front]) cards[front].classList.remove('is-front');
      front = f;
      cards[f].classList.add('is-front');
      document.getElementById('ringCount').textContent = pad(f + 1) + ' / ' + pad(list.length);
      document.getElementById('ringTitle').textContent = PF.pick(list[f].title);
      document.getElementById('ringDesc').textContent = PF.pick(list[f].desc);
    }
  }

  /* ---------- Stacked services ---------- */
  var stackCards = [];
  function renderStack() {
    var wrap = document.getElementById('stack');
    wrap.innerHTML = SERVICES.map(function (k, i) {
      var im = SVC_IMG[k];
      return '<article class="stack__card" style="--k:' + i + '"><div><b>' + pad(i + 1) + '</b><h3>' + esc(PF.t('svc.' + k + '.t')) + '</h3><p>' + esc(PF.t('svc.' + k + '.d')) +
        '</p><a href="#contact" data-brief-service="' + k + '">' + esc(PF.t('cta.contact')) + ' <span class="arr" aria-hidden="true">→</span></a></div>' +
        '<div class="stack__img"><img loading="lazy" alt="' + esc(PF.catLabel(k)) + '" src="' + imgOf(im[0], im[1]) + '"></div></article>';
    }).join('');
    stackCards = Array.prototype.slice.call(wrap.querySelectorAll('.stack__card'));
  }

  function updateStack() {
    for (var k = 0; k < stackCards.length - 1; k++) {
      var a = stackCards[k].getBoundingClientRect(), b = stackCards[k + 1].getBoundingClientRect();
      var q = M.clamp(1 - (b.top - a.top) / a.height, 0, 1);
      stackCards[k].style.transform = q > 0 ? 'scale(' + (1 - q * 0.07).toFixed(4) + ') rotateX(' + (q * 9).toFixed(2) + 'deg)' : '';
    }
  }

  /* ---------- About / stats ---------- */
  function renderAbout() {
    var picks = [['green-motion', 2], ['relief-cafe', 3], ['mimar-oman', 4]];
    document.querySelectorAll('.about__float img').forEach(function (im, i) { im.src = imgOf(picks[i][0], picks[i][1]); });
    var countries = {};
    PF.projects.forEach(function (p) { if (p.country) countries[p.country] = 1; });
    var data = [
      [PF.projects.filter(function (p) { return p.slug !== 'typography'; }).length, 'stats.brands'],
      [Object.keys(countries).length, 'stats.countries'],
      [PF.totalImages(), 'stats.designs'],
      [SERVICES.length, 'stats.disciplines']
    ];
    var wrap = document.getElementById('stats');
    wrap.innerHTML = data.map(function (d) { return '<div><b>' + d[0] + '</b><span>' + esc(PF.t(d[1])) + '</span></div>'; }).join('');
    wrap.querySelectorAll('b').forEach(function (b, i) { PF.countUp(b, data[i][0]); });
  }

  function renderAll() {
    renderOrbit();
    buildRing();
    renderStack();
    renderAbout();
    M.splitWords();
    PF.reveal('.reveal, [data-split]');
    M.magnetic('.mag', 0.25);
    M.refresh();
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.cursor();
    M.tilt(document.getElementById('orbitCard'), 9);
    spinOrbit();
    renderAll();
    var cubeSec = document.getElementById('process'), cube = document.getElementById('cube');
    var faces = cube.querySelectorAll('.cube__face'), steps = document.querySelectorAll('#cubeList li');
    faces.forEach(function (f, k) { f.style.setProperty('--k', k); });
    var floats = document.querySelectorAll('.about__float img'), about = document.getElementById('about');

    if (!M.reduce) {
      M.onScroll(function (y, vel) {
        spinBoost = M.clamp(Math.abs(vel) * 0.02, 0, 3);
        root.style.setProperty('--skew', M.clamp(vel * -0.03, -4, 4).toFixed(2) + 'deg');
        updateRing(y, vel);
        updateStack();
        var cp = M.progress(cubeSec, y);
        cube.style.transform = 'rotateX(-10deg) rotateY(' + (-cp * 270).toFixed(2) + 'deg)';
        var a = Math.round(cp * 3);
        steps.forEach(function (s, i) { s.classList.toggle('is-on', i === a); });
        var at = M.top(about);
        floats.forEach(function (im) { im.style.transform = 'translateY(' + ((y - at) * parseFloat(im.getAttribute('data-speed'))).toFixed(1) + 'px)'; });
      });
      window.addEventListener('resize', function () { renderOrbit(); layoutRing(); M.refresh(); });
    } else {
      steps.forEach(function (s) { s.classList.add('is-on'); });
    }

    PF.onLang(function () {
      renderAll();
      document.querySelectorAll('.reveal, [data-split]').forEach(function (e) { e.classList.add('is-in'); });
    });
  });
})();
