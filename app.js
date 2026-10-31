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

  /* Touch devices (phones and tablets, iOS and Android) get one image per project:
     a lighter 3D layer that mobile browsers keep animating smoothly. */
  var touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var isoCols = [], ISO_GAP = 18;
  /* Tiles keep the original size (column width of the original 6-column wall: max(170vw, 1500px) / 6);
     the wall gets extra columns on both sides and enough repeats to always fill the screen. */
  var ISO = touch ? { cols: 10, depth: 7 } : { cols: 18, depth: 7 };

  /* The tilted wall must cover the whole hero at every moment of the drift. Each column is one set of
     images (period P) repeated k times; drifting by up to P keeps (k-1)P filled, so k is chosen from the
     screen size. Width/height attributes let the layout be measured before the images load. */
  function buildIso() {
    var plane = document.getElementById('iso');
    var vw = innerWidth, big = Math.max(vw, innerHeight);
    var n = ISO.cols, perProject = touch || vw < 1024 ? 1 : 2, picks = [];
    PF.projects.forEach(function (p) { p.images.slice(0, perProject).forEach(function (im) { picks.push(im.concat(p.slug)); }); });
    var colW = (Math.max(1.7 * vw, 1500) - 5 * ISO_GAP) / 6;
    plane.style.width = Math.round(colW * n + ISO_GAP * (n - 1)) + 'px';
    plane.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
    /* The 6 centre columns hold exactly the original sets (so the view matches the original wall); extra
       columns (an even number per side, keeping each column's drift direction) are added on both sides.
       The repeat count k is even so a set boundary sits at the wall's centre, as in the original 2-copy wall. */
    var per = Math.ceil(picks.length / 6), side = (n - 6) / 2, sets = [], html = '';
    for (var c = 0; c < n; c++) {
      var o = c - side, set = [];
      /* Side columns repeat the original 6 sets so every column has the same height (a taller column would
         stretch the wall and shift its centre). */
      var src = ((o % 6) + 6) % 6;
      set = picks.slice(src * per, src * per + per);
      if (!set.length) set = picks.slice(0, per);
      sets.push(set.map(function (im) { return '<img alt="" decoding="async" src="' + PF.img(im[4], im[0]) + '" width="' + im[1] + '" height="' + im[2] + '">'; }).join(''));
      html += '<div class="iso__col">' + sets[c] + '</div>';
    }
    plane.innerHTML = html;
    /* Backing mosaic: enough tiles to fill the hero (170px x 220px cells, cycling through the same images). */
    var fill = document.getElementById('isoFill'), cells = Math.ceil((vw + 80) / 182) * Math.ceil((innerHeight + 80) / 232), fh = '';
    for (var f = 0; f < cells; f++) { var im = picks[f % picks.length]; fh += '<img alt="" decoding="async" src="' + PF.img(im[4], im[0]) + '">'; }
    fill.innerHTML = fh;
    var cols = plane.querySelectorAll('.iso__col'), minP = Infinity;
    cols.forEach(function (el) { minP = Math.min(minP, el.scrollHeight + ISO_GAP); });
    var k = Math.max(4, Math.min(16, Math.ceil(ISO.depth * big / minP) + 2));
    k += k % 2;
    plane.dataset.repeat = k;
    cols.forEach(function (el, i) { el.innerHTML = new Array(k + 1).join(sets[i]); });
    isoCols = Array.prototype.map.call(cols, function (el, i) {
      return { el: el, dir: i % 2 ? -1 : 1, secs: i % 2 ? 70 : 60, off: 0, period: (el.scrollHeight + ISO_GAP) / k };
    });
  }

  /* Column drift is driven from JS (CSS animations on this large 3D layer freeze in iOS Safari). */
  function animateIso() {
    var hero = document.getElementById('hero'), last = performance.now();
    (function frame(now) {
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (window.scrollY < hero.offsetHeight * 1.2) {
        isoCols.forEach(function (c) {
          c.off = ((c.off + c.dir * dt * c.period / c.secs) % c.period + c.period) % c.period;
          c.el.style.transform = 'translate3d(0,' + (-c.off).toFixed(1) + 'px,0)';
        });
      }
      requestAnimationFrame(frame);
    })(last);
  }

  /* ---------- Kinetic rows ---------- */
  var rows = [], rowX = [0, 0], rowW = [0, 0];
  function renderRows() {
    var words1 = SERVICES.map(PF.catLabel), words2 = PF.profile.markets.map(PF.countryLabel);
    rows = [document.getElementById('row1'), document.getElementById('row2')];
    var rtl = document.documentElement.dir === 'rtl';
    [words1, words2].forEach(function (words, i) {
      var items = words.map(function (w) { return '<span>' + esc(w) + '</span>'; });
      /* Rows are laid out left-to-right, so Arabic gets the items reversed to read in order from the right. */
      if (rtl) items.reverse();
      var chunk = items.join('');
      rows[i].innerHTML = chunk + chunk + chunk + chunk;
      rowW[i] = rows[i].scrollWidth / 2;
      /* Start with the first item (Egypt / first service) at the reading edge. */
      var cw = rowW[i] / 2;
      rowX[i] = rtl ? innerWidth - Math.ceil(innerWidth / cw) * cw : 0;
      rows[i].style.transform = 'translate3d(' + rowX[i].toFixed(1) + 'px,0,0)';
    });
  }

  function animateRows() {
    var vel = 0;
    M.onScroll(function (y, v) { vel = v; });
    (function tick() {
      var boost = 1 + Math.min(Math.abs(vel), 120) * 0.12, skew = M.clamp(vel * 0.12, -12, 12);
      rows.forEach(function (r, i) {
        var dir = (i ? 1 : -1) * (document.documentElement.dir === 'rtl' ? -1 : 1);
        rowX[i] -= dir * 0.6 * boost;
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

  /* Each card takes its cover's own proportions (fixed height), so the image fills it without cropping. */
  function layoutFlow() {
    var vw = innerWidth, vh = innerHeight, mobile = vw < 640;
    var h = mobile ? Math.min(vh * 0.46, vw * 0.9) : Math.max(300, Math.min(540, vh * 0.56));
    var maxW = mobile ? vw * 0.86 : vw * 0.5, left = 0;
    fgeo.gap = vw * 0.02;
    fgeo.centers = [];
    cards.forEach(function (c, i) {
      var im = list[i].images[0], a = M.clamp(im[1] / im[2], 0.6, 2);
      var w = Math.min(h * a, maxW);
      c.style.setProperty('--cw', Math.round(w) + 'px');
      c.style.setProperty('--ch', Math.round(w / a) + 'px');
      fgeo.centers.push(left + w / 2);
      left += w + fgeo.gap;
    });
    if (!M.reduce) flow.style.height = (list.length * (mobile ? 26 : 32) + 100) + 'vh';
  }

  function updateFlow(y) {
    var p = M.progress(flow, y), vw = innerWidth, c = fgeo.centers;
    var x = vw / 2 - (c[0] + (c[c.length - 1] - c[0]) * p);
    track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    var now = 0, best = 1e9;
    for (var i = 0; i < cards.length; i++) {
      var cx = x + c[i] - vw / 2;
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
    var data = [
      [PF.profile.years, 'stats.years', '+'],
      [PF.clients().length, 'stats.brands'],
      [PF.profile.markets.length, 'stats.countries'],
      [PF.totalImages(), 'stats.designs']
    ];
    var wrap = document.getElementById('stats');
    wrap.innerHTML = data.map(function (d) { return '<div><b>' + d[0] + (d[2] || '') + '</b><span>' + esc(PF.t(d[1])) + '</span></div>'; }).join('');
    wrap.querySelectorAll('b').forEach(function (b, i) { PF.countUp(b, data[i][0], data[i][2]); });
  }

  function renderAll() {
    renderName();
    renderRows();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderRows);
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
      animateIso();
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
      /* Mobile browsers fire resize when the address bar shows/hides; only re-layout when the width changes. */
      var lastW = innerWidth;
      window.addEventListener('resize', function () {
        if (innerWidth === lastW) { M.refresh(); return; }
        lastW = innerWidth;
        buildIso(); layoutFlow(); renderRows(); M.refresh();
      });
    }

    PF.onLang(function () {
      renderAll();
      document.querySelectorAll('.reveal, .row, [data-split]').forEach(function (e) { e.classList.add('is-in'); });
    });
  });
})();
