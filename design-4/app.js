/* Design 4 — Hyperspace: warp starfield, pointer-tilted hero, scroll-driven 3D tunnel, unfolding process. */
(function () {
  'use strict';
  var PF = window.PF, M = window.Motion;
  var SERVICES = ['branding', 'social', 'print', 'profile', 'type'];
  var root = document.documentElement;
  var lastVel = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ordered() { return PF.projects.filter(function (p) { return p.featured; }).concat(PF.projects.filter(function (p) { return !p.featured; })); }

  /* ---------- Starfield ---------- */
  function stars() {
    var c = document.getElementById('stars'), ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w, h, list = [];
    function size() { w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr; }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < 260; i++) list.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(), pz: 0 });
    function draw(speed) {
      ctx.fillStyle = 'rgba(5,6,11,' + (speed > 0.01 ? 0.35 : 1) + ')';
      ctx.fillRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, k = Math.max(w, h) * 0.5;
      list.forEach(function (s) {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0.02) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; s.pz = 1; }
        var sx = cx + (s.x / s.z) * k * 0.5, sy = cy + (s.y / s.z) * k * 0.5;
        var px = cx + (s.x / s.pz) * k * 0.5, py = cy + (s.y / s.pz) * k * 0.5;
        var a = Math.min(1, (1 - s.z) * 1.4);
        ctx.strokeStyle = s.x > 0.6 ? 'rgba(61,245,255,' + a + ')' : 'rgba(230,234,255,' + a + ')';
        ctx.lineWidth = (1 - s.z) * 2.2 * dpr;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx + 0.1, sy + 0.1); ctx.stroke();
      });
    }
    if (M.reduce) { draw(0); return; }
    (function tick() {
      lastVel *= 0.92;
      draw(0.0018 + Math.min(Math.abs(lastVel), 140) * 0.0004);
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Hero ---------- */
  function renderName() {
    var parts = PF.name().split(' ');
    document.querySelector('[data-name-first]').textContent = parts[0];
    document.querySelector('[data-name-last]').textContent = parts.slice(1).join(' ');
    document.querySelector('.hero__name').setAttribute('aria-label', PF.name());
  }

  function heroPointer() {
    var scene = document.getElementById('heroScene');
    if (M.reduce) return;
    window.addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      scene.style.setProperty('--hy', (x * 22).toFixed(2) + 'deg');
      scene.style.setProperty('--hx', (-y * 18).toFixed(2) + 'deg');
      scene.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
      scene.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ---------- Tunnel ---------- */
  var tunnel, world, floor, stage, cards = [], list = [], D = 520, LEAD = 700, geom = {};

  function buildTunnel() {
    tunnel = document.getElementById('work');
    world = document.getElementById('world');
    floor = document.getElementById('floor');
    stage = tunnel.querySelector('.tunnel__stage');
    list = ordered();
    world.innerHTML = '';
    cards = list.map(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 't-card';
      b.setAttribute('aria-label', PF.t('work.open') + ': ' + PF.pick(p.title));
      b.innerHTML = '<div class="t-card__img"><img alt=""' + PF.fit(p) + ' src="' + PF.cover(p) + '"' + (i > 3 ? ' loading="lazy"' : '') + '></div>' +
        '<div class="t-card__cap"><b>' + esc(PF.pick(p.title)) + '</b><span>' + esc(PF.catLabel(p.cats[0])) + '</span></div>';
      b.addEventListener('click', function () { PF.lightbox.open(p, 0); });
      world.appendChild(b);
      return b;
    });
    layoutTunnel();
  }

  function layoutTunnel() {
    var vw = innerWidth, vh = innerHeight, mobile = vw < 640;
    geom.cw = mobile ? Math.round(vw * 0.64) : Math.round(Math.max(220, Math.min(360, vw * 0.24)));
    geom.rx = mobile ? vw * 0.1 : Math.min(vw * 0.27, 440);
    geom.ry = mobile ? vh * 0.08 : Math.min(vh * 0.16, 170);
    geom.pos = list.map(function (p, i) {
      var th = i * 2.15;
      return { x: Math.cos(th) * geom.rx, y: Math.sin(th) * geom.ry, z: -(LEAD + i * D) };
    });
    cards.forEach(function (c) { c.style.setProperty('--cw', geom.cw + 'px'); });
    if (!M.reduce) tunnel.style.height = (list.length * 58 + 100) + 'vh';
  }

  var hudCount, hudTitle, hudBar, lastNow = -1;
  function updateTunnel(y) {
    var p = M.progress(tunnel, y);
    var cam = p * ((list.length - 1) * D + LEAD + 400);
    world.style.transform = 'translateZ(' + cam.toFixed(1) + 'px)';
    floor.style.setProperty('--fy', (cam * 0.4).toFixed(1) + 'px');
    var now = list.length - 1;
    for (var i = 0; i < cards.length; i++) {
      var g = geom.pos[i], rel = g.z + cam, c = cards[i], o;
      if (rel > -250 || rel < -D * 7.5) { c.style.visibility = 'hidden'; continue; }
      o = rel > -420 ? 1 - (rel + 420) / 170 : 1 + (rel + 420) / (D * 7);
      o = M.clamp(o, 0, 1);
      c.style.visibility = 'visible';
      c.style.opacity = o.toFixed(3);
      c.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
      c.style.transform = 'translate3d(' + g.x.toFixed(1) + 'px,' + g.y.toFixed(1) + 'px,' + g.z + 'px) rotateY(' + (-g.x / (geom.rx || 1) * 14).toFixed(2) + 'deg)';
      if (rel < -420 && i < now) now = i;
    }
    if (now !== lastNow) {
      lastNow = now;
      hudCount.textContent = pad(now + 1) + ' / ' + pad(list.length);
      hudTitle.textContent = PF.pick(list[now].title);
    }
    hudBar.style.setProperty('--hp', p.toFixed(3));
  }

  /* ---------- Services / stats / stairs ---------- */
  function renderServices() {
    var wrap = document.getElementById('svc');
    wrap.innerHTML = SERVICES.map(function (k, i) {
      return '<div class="svc__item" style="--k:' + i + '"><article class="svc__card"><b>' + pad(i + 1) + '</b><h3>' + esc(PF.t('svc.' + k + '.t')) + '</h3><p>' + esc(PF.t('svc.' + k + '.d')) + '</p></article></div>';
    }).join('');
    wrap.querySelectorAll('.svc__card').forEach(function (c) { M.tilt(c, 9); });
  }

  function renderStats() {
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

  function observe() {
    PF.reveal('.reveal, .svc__item, [data-split]');
  }

  function renderAll() {
    renderName();
    buildTunnel();
    lastNow = -1;
    renderServices();
    renderStats();
    M.splitWords();
    observe();
    M.magnetic('.mag', 0.28);
    M.refresh();
  }

  document.addEventListener('DOMContentLoaded', function () {
    hudCount = document.getElementById('hudCount');
    hudTitle = document.getElementById('hudTitle');
    hudBar = document.getElementById('hudBar');
    stars();
    heroPointer();
    M.cursor();
    renderAll();

    var heroScene = document.getElementById('heroScene'), heroCopy = document.querySelector('.hero__copy');
    var stairsSec = document.getElementById('process'), stairs = document.querySelectorAll('.stair');
    stairs.forEach(function (s, k) { s.style.setProperty('--k', k); });

    if (!M.reduce) {
      M.onScroll(function (y, vel) {
        lastVel = vel;
        root.style.setProperty('--skew', M.clamp(vel * -0.035, -4, 4).toFixed(2) + 'deg');
        var hp = M.clamp(y / innerHeight, 0, 1);
        heroScene.style.transform = 'scale(' + (1 + hp * 0.7).toFixed(3) + ')';
        heroScene.style.opacity = (1 - hp * 1.1).toFixed(3);
        heroCopy.style.transform = 'translateY(' + (-hp * 140).toFixed(1) + 'px)';
        heroCopy.style.opacity = (1 - hp * 1.3).toFixed(3);
        updateTunnel(y);
        var sp = M.progress(stairsSec, y);
        stairs.forEach(function (s, k) { s.style.setProperty('--p', M.clamp(sp * 1.7 - k * 0.18, 0, 1).toFixed(3)); });
      });
      window.addEventListener('resize', function () { layoutTunnel(); M.refresh(); });
    }

    PF.onLang(function () {
      renderAll();
      document.querySelectorAll('.reveal, .svc__item, [data-split]').forEach(function (e) { e.classList.add('is-in'); });
    });
  });
})();
