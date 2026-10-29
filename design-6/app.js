/* Design 6 — Kinetic: isometric wall that flattens on scroll, velocity-driven type rows, 3D coverflow, folding steps, scroll-read text. */
(function () {
  'use strict';
  var PF = window.PF, M = window.Motion;
  var SERVICES = ['branding', 'social', 'print', 'profile', 'type'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ordered() { return PF.projects.filter(function (p) { return p.featured; }).concat(PF.projects.filter(function (p) { return !p.featured; })); }

  /* ---------- Hero ---------- */
  function renderName() {
    var parts = PF.name().split(' ');
    document.querySelector('[data-name-first]').textContent = parts[0];
    document.querySelector('[data-name-last]').textContent = parts.slice(1).join(' ');
    document.querySelector('.hero__name').setAttribute('aria-label', PF.name());
  }

  function buildIso() {
    var picks = [];
    PF.projects.forEach(function (p) { p.images.slice(0, 2).forEach(function (im) { picks.push(PF.img(p.slug, im[0])); }); });
    var cols = 6, per = Math.ceil(picks.length / cols), html = '';
    for (var c = 0; c < cols; c++) {
      var col = picks.slice(c * per, c * per + per);
      var imgs = col.map(function (src) { return '<img alt="" loading="lazy" src="' + src + '">'; }).join('');
      html += '<div class="iso__col">' + imgs + imgs + '</div>';
    }
    document.getElementById('iso').innerHTML = html;
  }

  /* ---------- Kinetic rows ---------- */
  var rows = [], rowX = [0, 0], rowW = [0, 0];
  function renderRows() {
    var words1 = SERVICES.map(PF.catLabel), words2 = ['UAE', 'KSA', 'Oman', 'Egypt'].map(function (w, i) { return PF.t('country.' + ['ae', 'sa', 'om', 'eg'][i]); });
    rows = [document.getElementById('row1'), document.getElementById('row2')];
    [words1, words2].forEach(function (words, i) {
      var chunk = words.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('');
      rows[i].innerHTML = chunk + chunk + chunk + chunk;
      rowW[i] = rows[i].scrollWidth / 2;
    });
  }

  function animateRows() {
    var vel = 0;
    M.onScroll(function (y, v) { vel = v; });
    (function tick() {
      var boost = 1 + Math.min(Math.abs(vel), 120) * 0.12, skew = M.clamp(vel * 0.12, -12, 12);
      rows.forEach(function (r, i) {
        rowX[i] -= (i ? -1 : 1) * 0.6 * boost;
        if (rowW[i]) { rowX[i] = ((rowX[i] % rowW[i]) - rowW[i]) % rowW[i]; }
        r.style.transform = 'translate3d(' + rowX[i].toFixed(1) + 'px,0,0) skewX(' + (-skew).toFixed(2) + 'deg)';
      });
      vel *= 0.9;
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Coverflow ---------- */
  var flow, track, cards = [], list = [], fgeo = {}, lastNow = -1;
  function buildFlow() {
    flow = document.getElementById('work');
    track = document.getElementById('track');
    list = ordered();
    track.innerHTML = '';
    cards = list.map(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'flow__card';
      b.setAttribute('aria-label', PF.t('work.open') + ': ' + PF.pick(p.title));
      b.innerHTML = '<img alt=""' + PF.fit(p) + ' src="' + PF.cover(p) + '"' + (i > 3 ? ' loading="lazy"' : '') + '><i class="flow__num">' + pad(i + 1) + '</i>' +
        '<figcaption><b>' + esc(PF.pick(p.title)) + '</b><span>' + esc(p.cats.map(PF.catLabel).join(' · ')) + '</span></figcaption>';
      b.addEventListener('click', function () { PF.lightbox.open(p, 0); });
      track.appendChild(b);
      return b;
    });
    layoutFlow();
    lastNow = -1;
  }

  function layoutFlow() {
    var vw = innerWidth;
    fgeo.cw = vw < 640 ? Math.round(vw * 0.66) : Math.round(Math.max(260, Math.min(400, vw * 0.27)));
    fgeo.gap = vw * 0.02;
    cards.forEach(function (c) { c.style.setProperty('--cw', fgeo.cw + 'px'); });
    fgeo.total = list.length * (fgeo.cw + fgeo.gap) - fgeo.gap;
    if (!M.reduce) flow.style.height = (list.length * (vw < 640 ? 26 : 32) + 100) + 'vh';
  }

  function updateFlow(y) {
    var p = M.progress(flow, y), vw = innerWidth;
    var start = vw / 2 - fgeo.cw / 2, end = vw / 2 - (fgeo.total - fgeo.cw / 2);
    var x = start + (end - start) * p;
    track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    var now = 0, best = 1e9;
    for (var i = 0; i < cards.length; i++) {
      var cx = x + i * (fgeo.cw + fgeo.gap) + fgeo.cw / 2 - vw / 2;
      var n = M.clamp(cx / (vw * 0.5), -1.6, 1.6);
      if (Math.abs(cx) > vw * 1.2) { cards[i].style.visibility = 'hidden'; continue; }
      cards[i].style.visibility = 'visible';
      cards[i].style.transform = 'translateY(-50%) translateZ(' + (-Math.abs(n) * 260).toFixed(1) + 'px) rotateY(' + (-n * 42).toFixed(2) + 'deg) scale(' + (1 - Math.min(Math.abs(n), 1) * 0.12).toFixed(3) + ')';
      cards[i].style.zIndex = String(100 - Math.round(Math.abs(n) * 50));
      if (Math.abs(cx) < best) { best = Math.abs(cx); now = i; }
    }
    if (now !== lastNow) {
      lastNow = now;
      document.getElementById('flowCount').textContent = pad(now + 1) + ' / ' + pad(list.length);
    }
    document.getElementById('flowBar').style.setProperty('--fp', p.toFixed(3));
  }

  /* ---------- Services rows ---------- */
  function renderRowsList() {
    document.getElementById('rows').innerHTML = SERVICES.map(function (k, i) {
      var t = esc(PF.t('svc.' + k + '.t'));
      return '<a class="row" href="#contact" data-brief-service="' + k + '" style="--k:' + i + '"><b>' + pad(i + 1) + '</b>' +
        '<span class="row__flip"><span>' + t + '</span><span aria-hidden="true">' + t + '</span></span>' +
        '<p>' + esc(PF.t('svc.' + k + '.d')) + '</p><span class="row__go" aria-hidden="true">→</span></a>';
    }).join('');
  }

  /* ---------- Scroll-read text ---------- */
  var readWords = [];
  function splitRead() {
    var el = document.getElementById('readText');
    var text = PF.t('about.p1') + ' ' + PF.t('about.p2');
    el.innerHTML = text.split(/\s+/).map(function (w) { return '<span class="rw">' + esc(w) + '</span>'; }).join(' ');
    readWords = Array.prototype.slice.call(el.querySelectorAll('.rw'));
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

  function renderAll() {
    renderName();
    renderRows();
    buildFlow();
    renderRowsList();
    splitRead();
    renderStats();
    M.splitWords();
    PF.reveal('.reveal, .row, [data-split]');
    M.magnetic('.mag', 0.25);
    M.refresh();
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.cursor();
    buildIso();
    renderAll();
    var hero = document.getElementById('hero'), plane = document.getElementById('iso'), name = document.querySelector('.hero__name');
    var fold = document.querySelectorAll('.fold__panel'), foldSec = document.getElementById('fold'), read = document.getElementById('readText');

    if (!M.reduce) {
      animateRows();
      M.onScroll(function (y) {
        var hp = M.clamp(y / (hero.offsetHeight * 0.9), 0, 1);
        plane.style.setProperty('--ix', (52 - hp * 40).toFixed(2) + 'deg');
        plane.style.setProperty('--iz', (-32 + hp * 26).toFixed(2) + 'deg');
        plane.style.setProperty('--is', (1.1 + hp * 0.5).toFixed(3));
        name.style.transform = 'translateY(' + (-hp * 120).toFixed(1) + 'px) scale(' + (1 - hp * 0.12).toFixed(3) + ')';
        updateFlow(y);
        var fp = M.pass(foldSec, y);
        fold.forEach(function (f, k) { f.style.setProperty('--f', M.clamp(fp * 3.2 - 0.55 - k * 0.22, 0, 1).toFixed(3)); });
        var rp = M.clamp((y + innerHeight * 0.75 - M.top(read)) / (read.offsetHeight + innerHeight * 0.25), 0, 1);
        var lit = Math.round(rp * readWords.length);
        readWords.forEach(function (w, i) { w.classList.toggle('on', i < lit); w.classList.toggle('now', i === lit - 1 && lit < readWords.length); });
      });
      window.addEventListener('resize', function () { layoutFlow(); renderRows(); M.refresh(); });
    }

    PF.onLang(function () {
      renderAll();
      document.querySelectorAll('.reveal, .row, [data-split]').forEach(function (e) { e.classList.add('is-in'); });
    });
  });
})();
